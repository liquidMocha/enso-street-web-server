export class Owner {
    readonly id: string;
    readonly email: string;
    readonly stripeAccountId: string | undefined;

    constructor(id: string, email: string, stripeAccountId?: string) {
        this.id = id;
        this.email = email;
        this.stripeAccountId = stripeAccountId;
    }
}
