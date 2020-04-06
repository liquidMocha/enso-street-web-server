// @ts-ignore
import UserRepository from "../UserRepository";
// @ts-ignore
import * as ItemRepository from "../../item/ItemRepository";
import {getCartItemsFor, update as updateCart} from "./CartRepository";
import {CartMapper} from "./CartMapper";
import {ItemDto, OwnerBatchDto} from "./OwnerBatchDto";
// @ts-ignore
import {getUser} from "../UserService";
import {CartDto} from "./CartDto";

export const getCartForUser = async (email: string): Promise<CartDto> => {
    const user = await UserRepository.findOne({email});
    const cart = await getCartItemsFor(user.id);

    const ownerBatchDto = Promise.all(cart.ownerBatches.map(async ownerBatch => {
        const user = await getUser(ownerBatch.ownerId);

        const cartItemDtos = ownerBatch.cartItems.map(async cartItem => {
            const itemDao = await ItemRepository.getItemById(cartItem.id);
            return new ItemDto(
                cartItem.id,
                itemDao.title,
                itemDao.rentalDailyPrice,
                itemDao.imageUrl,
                cartItem.quantity
            )
        });

        return new OwnerBatchDto(user.name, user.email, await Promise.all(cartItemDtos))
    }));

    return new CartDto(await ownerBatchDto)
};

export const addItemToCartForUser = async (email: string, itemId: string) => {
    const user = await UserRepository.findOne({email});
    const cart = await getCartItemsFor(user.id);

    const ownerId = await ItemRepository.findOwnerForItem(itemId);
    cart.addItem(itemId, ownerId);

    return await updateCart((await user).id, CartMapper.toDao(cart));
};

export const removeSingleItemFromCart = async (email: string, itemId: string) => {
    const user = await UserRepository.findOne({email});
    const cart = await getCartItemsFor(user.id);

    const ownerId = await ItemRepository.findOwnerForItem(itemId);
    cart.removeItem(itemId, ownerId);

    return await updateCart((await user).id, CartMapper.toDao(cart));
};

export const removeAllInstanceOfItemFromCart = async (email: string, itemId: string) => {
    const user = await UserRepository.findOne({email});
    const cart = await getCartItemsFor(user.id);

    const ownerId = await ItemRepository.findOwnerForItem(itemId);
    cart.removeAllInstanceOfItem(itemId, ownerId);

    return await updateCart((await user).id, CartMapper.toDao(cart));
};
