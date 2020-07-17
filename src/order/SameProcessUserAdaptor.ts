import {UserAdaptor} from "./UserAdaptor";
import {UserProfilePorts} from "../userprofile/UserProfilePorts";
import {UserProfileDto} from "../userprofile/UserProfileDto";
import {Owner} from "../item/Owner";

export class SameProcessUserAdaptor implements UserAdaptor {
    private userProfilePorts: UserProfilePorts;

    constructor(userProfilePorts: UserProfilePorts) {
        this.userProfilePorts = userProfilePorts;
    }

    async getRenterById(userId: string): Promise<UserProfileDto> {
        return await this.userProfilePorts.fetchUserProfile(userId);
    }

    getOwnerById(userId: string): Promise<Owner> {
        return this.userProfilePorts.fetchOwner(userId);
    }

}
