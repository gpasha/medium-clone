import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserEntity } from "./user.entity";
import { sign } from 'jsonwebtoken';
import { UserResponseEnterface } from "./types/userResponse.interface";
import { JWT_SECRET } from "config";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const newUser = new UserEntity()
        Object.assign(newUser, createUserDto)
        return await this.userRepository.save(newUser)
    }

    generateJWT(user: UserEntity): string {
        return sign(
            {
                id: user.id,
                username: user.username,
                email: user.email
            },
            JWT_SECRET
        )
    }

    buildUserresponse(user: UserEntity): UserResponseEnterface {
        return {
            user: {
                ...user,
                token: this.generateJWT(user)
            }

        }
    }
}
