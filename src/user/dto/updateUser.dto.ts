import { IsNotEmpty, IsOptional } from "class-validator"

export class UpdateUserDto {
    @IsNotEmpty()
    @IsOptional()
    readonly email: string

    @IsNotEmpty()
    @IsOptional()
    readonly username: string

    @IsNotEmpty()
    @IsOptional()
    readonly bio: string

    @IsNotEmpty()
    @IsOptional()
    readonly image: string

    // @IsNotEmpty()
    // @IsOptional()
    // readonly password: string
}