import {UserProfileDto} from "../userprofile/UserProfileDto";
import {Owner} from "../item/Owner";

export interface UserAdaptor {
    getRenterById(userId: string): Promise<UserProfileDto>

    getOwnerById(userId: string): Promise<Owner>
}
