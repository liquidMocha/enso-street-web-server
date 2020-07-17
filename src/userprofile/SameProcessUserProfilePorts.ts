import {UserProfileDto} from "./UserProfileDto";
import {UserProfilePorts} from "./UserProfilePorts";
import {getUserProfile} from "./UserProfileService";
import {Owner} from "../item/Owner";
import UserRepository from "../user/UserRepository";

export class SameProcessUserProfilePorts implements UserProfilePorts {
    fetchUserProfile(userId: string): Promise<UserProfileDto> {
        return getUserProfile(userId);
    }

    fetchOwner(userId: string): Promise<Owner> {
        return UserRepository.getOwner(userId);
    }
}
