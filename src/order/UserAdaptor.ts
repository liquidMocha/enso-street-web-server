import {UserProfileDto} from "../userprofile/UserProfileDto";

export interface UserAdaptor {
    getRenterById(userId: string): Promise<UserProfileDto>
}
