import {UserProfileDto} from "./UserProfileDto";
import {UserProfilePorts} from "./UserProfilePorts";
import {getUserProfile} from "./UserProfileService";

export class SameProcessUserProfilePorts implements UserProfilePorts {
    fetchUserProfile(userId: string): Promise<UserProfileDto> {
        return getUserProfile(userId);
    }
}
