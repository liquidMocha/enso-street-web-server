export class Owner {
    readonly id: string;
    readonly email: string;
    readonly stripeAccountId: string | undefined;
    readonly name: string;

    constructor(id: string, email: string, name: string, stripeAccountId?: string) {
        this.id = id;
        this.email = email;
        this.stripeAccountId = stripeAccountId;
        this.name = name;
    }
}
