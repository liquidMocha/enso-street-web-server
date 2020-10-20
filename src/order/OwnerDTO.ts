import {Owner} from "../item/Owner";

export interface OwnerDTO {
    alias: string
}

export function ownerToDto(owner: Owner): OwnerDTO {
    return {
        alias: owner.name
    }
}
