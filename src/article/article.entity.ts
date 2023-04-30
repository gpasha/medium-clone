import { UserEntity } from "@app/user/user.entity";
import { BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'articles' })
export class ArticleEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    slug: string

    @Column({ default: '' })
    title: string

    @Column({ default: '' })
    description: string

    @Column({ default: '' })
    body: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date

    @BeforeUpdate()
    updateTimeStamp() {
        this.updatedAt = new Date()
    }

    @Column('simple-array')
    tagList: string[]

    @Column({ default: 0 })
    favoritesCount: number

    @ManyToOne(() => UserEntity, user => user.articles, { eager: true })
    author: UserEntity
}
