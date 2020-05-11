import {toDto} from "./UserProfileMapper";
import {getUserProfileByUserId} from "./UserProfileRepository";
import {UserProfileDto} from "./UserProfileDto";

export async function getUserProfile(userId: string): Promise<UserProfileDto> {
    const userProfile = await getUserProfileByUserId(userId);
    return toDto(userProfile);
}
