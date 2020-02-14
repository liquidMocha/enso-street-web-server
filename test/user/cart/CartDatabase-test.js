import {assert} from "chai";
import {setupUser} from "../../TestHelper";
import {addItemForUser, getCart} from '../../../user/cart/CartRepository';
import database from "../../../database";

describe('cart', () => {
    afterEach(() => {
        database.none('truncate public.user cascade;');
        database.none('truncate public.user_profile cascade;');
    });

    const email = "some@email.com";
    const name = "jon doe";

    it('should add item to cart for user', async () => {
        await setupUser({email, name});

        const itemId = "abc123";
        const item = {itemId};
        const secondItemId = "111aaaa";
        const secondItem = {itemId: secondItemId};

        await addItemForUser(item, email);
        await addItemForUser(secondItem, email);

        const cart = await getCart(email);

        assert.deepEqual(cart, [item, secondItem]);
    });

    it('should retrieve cart for user', async () => {
        await setupUser({email, name});

        const itemId = "abc123";
        const item = {itemId};
        await addItemForUser(item, email);

        const cart = await getCart(email);

        assert.deepEqual(cart, [item])
    });
});
