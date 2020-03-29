import UserRepository from "../UserRepository";
import * as ItemRepository from "../../item/ItemRepository";
import _ from "lodash";

export const getCartForUser = async (email) => {
    const user = await UserRepository.findOne({email});
    const cart = user.cart;

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
