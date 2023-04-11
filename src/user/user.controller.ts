import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserResponseEnterface } from "./types/userResponse.interface";
import { UserService } from "./user.service";

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Post('users')
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseEnterface> {
        const user = await this.userService.createUser(createUserDto)
        return this.userService.buildUserresponse(user)
    }
}