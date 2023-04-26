import { Injectable } from "@nestjs/common";

@Injectable()
export class ArticleService {
    async createArticle() {
        return 'Create article in Service'
    }
}
