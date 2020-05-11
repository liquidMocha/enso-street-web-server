import {UserProfileDto} from "./UserProfileDto";

export interface UserProfilePorts {
    fetchUserProfile(userId: string): Promise<UserProfileDto>
}
