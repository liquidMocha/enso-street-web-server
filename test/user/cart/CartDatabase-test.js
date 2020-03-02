import {assert} from "chai";
import {setupItem, setupUser} from "../../TestHelper";
import {addItemForUser, getItemsInCart} from '../../../user/cart/CartRepository';
import uuidv4 from 'uuid/v4';
import database from "../../../database";

describe('cart', () => {
    afterEach(() => {
        database.none('truncate public.user cascade;');
        database.none('truncate public.user_profile cascade;');
    });

    const email = "some@email.com";
    const name = "jon doe";

    it('should add to item\'s quantity when adding duplicate items', async () => {
        const userId = await setupUser({email, name});

        const itemId = uuidv4();
        await setupItem(itemId);

        await addItemForUser(itemId, userId);
        await addItemForUser(itemId, userId);

        const cart = await getItemsInCart(userId);

        assert.deepEqual(cart, [{id: itemId, quantity: 2}]);
    });

    it('should add item to cart for user', async () => {
        const userId = await setupUser({email, name});

        const itemId = uuidv4();
        const secondItemId = uuidv4();

        await setupItem(itemId);
        await setupItem(secondItemId);

        await addItemForUser(itemId, userId);
        await addItemForUser(secondItemId, userId);

        const cart = await getItemsInCart(userId);

        assert.deepEqual(cart, [{id: itemId, quantity: 1}, {id: secondItemId, quantity: 1}]);
    });

    it('should retrieve cart for user', async () => {
        const userId = await setupUser({email, name});

        const itemId = uuidv4();
        await setupItem(itemId);

        await addItemForUser(itemId, userId);

        const cart = await getItemsInCart(userId);

        assert.deepEqual(cart, [{id: itemId, quantity: 1}])
    });
});
