import {UserProfileDto} from "./UserProfileDto";
import {Owner} from "../item/Owner";

export interface UserProfilePorts {
    fetchUserProfile(userId: string): Promise<UserProfileDto>

    fetchOwner(userId: string): Promise<Owner>
}
