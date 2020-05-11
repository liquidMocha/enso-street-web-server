export interface UserProfileDto {
    id: string,
    name: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
    email?: string,
    defaultAddress?: LocationDto,
    user: UserDto,
    contacts: ContactDto[]
}
