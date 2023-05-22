import { User } from "@app/user/decorators/user.decorator";
import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ProfileResponse } from "./types/profileResponse.interface";
import { ProfileService } from "./profile.service";
import { AuthGuard } from "@app/user/guards/auth.guard";

@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get(':username')
    async getProfile(
        @User('id') currentUserId: number,
        @Param('username') profileUsername: string
    ): Promise<ProfileResponse> {
        const profile = await this.profileService.getProfile(currentUserId, profileUsername)
        return this.profileService.buildProfileResponse(profile)
    }

    @Post(':username/follow')
    @UseGuards(AuthGuard)
    async followProfile(
        @User('id') currentUserId: number,
        @Param('username') profileUsername: string
    ): Promise<ProfileResponse> {
        const profile = await this.profileService.followProfile(currentUserId, profileUsername)
        return this.profileService.buildProfileResponse(profile)
    }
}