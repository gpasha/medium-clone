import { UserEntity } from "@app/user/user.entity";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleEntity } from "./article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, getRepository } from "typeorm";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import slugify from "slugify";
import { UpdateArticleDto } from "./dto/updateArticle.dto";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ) { }

    async findAll(currentUserId: string, query: any): Promise<ArticlesResponseInterface> {
        const queryBuilder = getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author')

        const articlesCount = await queryBuilder.getCount()

        if (query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {
                tag: `%${query.tag}%`
            })
        }

        if (query.author) {
            const author = await this.userRepository.findOne({ username: query.author })
            queryBuilder.andWhere('articles.authorId = :id', {
                id: author.id
            })
        }

        if (query.favorited) {
            const author = await this.userRepository.findOne({
                username: query.favorited
            }, {
                relations: ['favorites']
            })
            const ids = author.favorites.map(favorite => favorite.id)
            if (ids.length) {
                queryBuilder.andWhere('articles.id IN (:...ids)', { ids })
            } else {
                queryBuilder.andWhere('1=0')
            }
        }

        if (query.limit) {
            queryBuilder.limit(query.limit)
        }

        if (query.offset) {
            queryBuilder.offset(query.offset)
        }

        let favoriteIds: number[] = []

        if (currentUserId) {
            const currentUser = await this.userRepository.findOne(currentUserId, {
                relations: ['favorites']
            })
            favoriteIds = currentUser.favorites.map(favorite => favorite.id)
        }

        const articles = await queryBuilder.getMany()

        const articlesWithFavorites = articles.map(article => {
            const favorited = favoriteIds.includes(article.id)
            return { ...article, favorited }
        })

        return { articles: articlesWithFavorites, articlesCount }
    }

    async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        const article = new ArticleEntity()
        Object.assign(article, createArticleDto)

        if (!article.tagList) {
            article.tagList = []
        }

        article.slug = this.getSlug(createArticleDto.title)

        article.author = currentUser

        return await this.articleRepository.save(article)
    }

    private getSlug(title: string): string {
        return slugify(title, { lower: true }) + '-' +
            ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    }

    buildArticleresponse(article: ArticleEntity): ArticleResponseInterface {
        return { article }
    }

    async getArticleBySlug(slug: string): Promise<ArticleEntity> {
        return await this.articleRepository.findOne({ slug })
    }

    async updateArticle(slug: string, currentUserId: number, updateArticleDto: UpdateArticleDto): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({ slug })

        if (!article) {
            throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND)
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN)
        }

        Object.assign(article, updateArticleDto)

        return this.articleRepository.save(article)
    }

    async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
        const article = await this.articleRepository.findOne({ slug })

        if (!article) {
            throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND)
        }

        if (article.author.id !== currentUserId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN)
        }

        return await this.articleRepository.delete({ slug })
    }

    async addArticleToFavotites(slug: string, currentUserId: number): Promise<ArticleEntity> {
        const article = await this.getArticleBySlug(slug)
        const user = await this.userRepository.findOne(currentUserId, {
            relations: ['favorites']
        })

        const isNotFavorited = user.favorites
            .findIndex(articleInFavorites => articleInFavorites.id === article.id) === -1

        if (isNotFavorited) {
            user.favorites.push(article)
            article.favoritesCount++
            await this.userRepository.save(user)
            await this.articleRepository.save(article)
        }

        return article
    }

    async deleteArticleFromFavotites(slug: string, currentUserId: number): Promise<ArticleEntity> {
        const article = await this.getArticleBySlug(slug)
        const user = await this.userRepository.findOne(currentUserId, {
            relations: ['favorites']
        })

        const favoriteIndex = user.favorites
            .findIndex(articleInFavorites => articleInFavorites.id === article.id)

        if (favoriteIndex >= 0) {
            user.favorites.splice(favoriteIndex, 1)
            article.favoritesCount--
            await this.userRepository.save(user)
            await this.articleRepository.save(article)
        }

        return article
    }
}
