import { UserEntity } from "@app/user/user.entity";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleEntity } from "./article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import slugify from "slugify";

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>
    ) { }

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
}
