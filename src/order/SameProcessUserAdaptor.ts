import {UserAdaptor} from "./UserAdaptor";
import {UserProfilePorts} from "../userprofile/UserProfilePorts";
import {UserProfileDto} from "../userprofile/UserProfileDto";

export class SameProcessUserAdaptor implements UserAdaptor {
    private userProfilePorts: UserProfilePorts;

    constructor(userProfilePorts: UserProfilePorts) {
        this.userProfilePorts = userProfilePorts;
    }

    async getRenterById(userId: string): Promise<UserProfileDto> {
        return await this.userProfilePorts.fetchUserProfile(userId);
    }

}
