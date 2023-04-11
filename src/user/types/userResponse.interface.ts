import { UserType } from "./user.type";

export interface UserResponseEnterface {
    user: UserType & { token: string }
}
