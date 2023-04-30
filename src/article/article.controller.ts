import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { UserEntity } from "@app/user/user.entity";
import { User } from "@app/user/decorators/user.decorator";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { UpdateArticleDto } from "./dto/updateArticle.dto";

@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async create(
        @User() currentUser: UserEntity,
        @Body('article') createArticleDto: CreateArticleDto
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.createArticle(currentUser, createArticleDto)
        return this.articleService.buildArticleresponse(article)
    }

    @Get(':slug')
    async getArticle(
        @Param('slug') slug: string
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.getArticleBySlug(slug)
        return this.articleService.buildArticleresponse(article)
    }

    @Put(':slug')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateArticle(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
        @Body('article') updateArticleDto: UpdateArticleDto
    ): Promise<ArticleResponseInterface> {
        const updatedArticle = await this.articleService.updateArticle(slug, currentUserId, updateArticleDto)
        return this.articleService.buildArticleresponse(updatedArticle)
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
