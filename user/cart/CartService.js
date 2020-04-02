import UserRepository from "../UserRepository";
import * as ItemRepository from "../../item/ItemRepository";
import _ from "lodash";
import {getCartItemsFor, update as updateCart} from "./CartRepository";

export const getCartForUser = async (email) => {
    const user = await UserRepository.findOne({email});
    const cart = await getCartItemsFor(user.id);

    const itemDAOs = await Promise.all(
        cart.items.map(async cartItem => {
            return {
                ...(await ItemRepository.getItemById(cartItem.id)),
                quantity: cartItem.quantity
            }
        })
    );
    const ownerBatches = _.groupBy(itemDAOs, 'ownerEmail');

    return await Promise.all(
        Object.entries(ownerBatches).map(toCartDTO)
    );
};

export const addItemToCartForUser = async (email, itemId) => {
    const user = UserRepository.findOne({email});
    const cart = await getCartItemsFor(user.id);

    cart.addItem(itemId);

    return updateCart((await user).id, cart);
};

export const removeSingleItemFromCart = async (email, itemId) => {
    const user = UserRepository.findOne({email});
    const cart = await getCartItemsFor(user.id);

    cart.removeItem(itemId);

    return updateCart((await user).id, cart);
};

async function toCartDTO([email, itemDAOs]) {
    const userName = (await UserRepository.findOne({email: email})).profile.name;
    const items = itemDAOs.map(dao => {
        return {...(dao.toDTO()), quantity: dao.quantity};
    });

    return {
        owner: {
            name: userName,
            email: email
        },
        items: items
    }
}
