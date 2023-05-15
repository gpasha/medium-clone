import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProfileType } from "./types/profile.type";
import { ProfileResponse } from "./types/profileResponse.interface";
import { UserEntity } from "@app/user/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class ProfileService {
    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) { }

    async getProfile(currentUserId: number, profileUsername: string): Promise<ProfileType> {
        const user = await this.userRepository.findOne({
            username: profileUsername
        })

        if (!user) {
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND)
        }

        return { ...user, following: false }
    }

    buildProfileResponse(profile: ProfileType): ProfileResponse {
        delete profile.email
        return { profile }
    }
}