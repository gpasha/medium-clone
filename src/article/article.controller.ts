import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { UserEntity } from "@app/user/user.entity";
import { User } from "@app/user/decorators/user.decorator";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleResponseInterface } from "./types/articleResponse.interface";

@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @Post()
    @UseGuards(AuthGuard)
    async create(
        @User() currentUser: UserEntity,
        @Body('article') createArticleDto: CreateArticleDto
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.createArticle(currentUser, createArticleDto)
        return this.articleService.buildArticleresponse(article)
    }

    //http://localhost:3000/articles?slug=some-test-title-4-a227kz
    // @Get() //v2
    // async getArticle(
    //     @Query('slug') slug: string
    // ): Promise<ArticleResponseInterface> {

    //http://localhost:3000/articles/some-test-title-4-a227kz
    @Get(':slug')
    async getArticle(
        @Param('slug') slug: string
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.getArticleBySlug(slug)
        return this.articleService.buildArticleresponse(article)
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(
        @User('id') currentUserId: number,
        @Param('slug') slug: string
    ) {
        return this.articleService.deleteArticle(slug, currentUserId)
    }
}
