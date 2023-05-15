import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDb1681134019977 implements MigrationInterface {
    name = 'SeedDb1681134019977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
        );

        // password is 123
        await queryRunner.query(
            `INSERT INTO users (username, email, password) VALUES ('John', 'john@gmail.com', '$2b$10$3Thnh5yvF8hCzNyyg8Igk.niqI.i4Wjm.otXR0BKgJvQVl.zElr96')`,
        );

        await queryRunner.query(
            `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article title', 'First article description', 'First article body', 'coffee, dragons', 1)`,
        );

        await queryRunner.query(
            `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article', 'Second article title', 'Second article description', 'Second article body', 'coffee, nestjs', 1)`,
        );
    }

    public async down(): Promise<void> { }

}
