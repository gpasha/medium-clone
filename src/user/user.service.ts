import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserEntity } from "./user.entity";
import { sign } from 'jsonwebtoken';
import { UserResponseEnterface } from "./types/userResponse.interface";
import { JWT_SECRET } from "config";
import { LoginUserDto } from "./dto/loginUser.dto";
import { compare } from "bcrypt";
import { UpdateUserDto } from "./dto/UpdateUser.dto";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({
            email: createUserDto.email
        })
        const userByName = await this.userRepository.findOne({
            username: createUserDto.username
        })

        if (userByEmail || userByName) {
            throw new HttpException('Email or username are taken', HttpStatus.UNPROCESSABLE_ENTITY)
        }

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

    buildUserResponse(user: UserEntity): UserResponseEnterface {
        return {
            user: {
                ...user,
                token: this.generateJWT(user)
            }

        }
    }


    async login({ email, password }: LoginUserDto): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            email: email
        }, {
            select: ['id', 'email', 'username', 'bio', 'image', 'password']
        })

        if (!user) {
            throw new HttpException('Credentials are not valid', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const isCorrectPassword = await this.comparePassword(password, user.password)

        if (!isCorrectPassword) {
            throw new HttpException('Email or password is incorrect', HttpStatus.UNPROCESSABLE_ENTITY)
        }

        delete user.password
        return user
    }

    async comparePassword(password: string, hashPassword: string) {
        return await compare(password, hashPassword).then(function (result: boolean) {
            return result
        })
    }

    findUserById(id: number): Promise<UserEntity> {
        return this.userRepository.findOne(id)
    }

    async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        // await this.userRepository.update({ id: userId }, { ...updateUserDto })
        // return await this.findUserById(id: userId)
        const user = await this.findUserById(userId)
        Object.assign(user, updateUserDto)
        return await this.userRepository.save(user)
    }
}
