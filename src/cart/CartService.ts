import {getCartItemsFor, getCartItemsQuantitiesFor, update as updateCart} from "./CartRepository";
import {CartMapper} from "./CartMapper";
import {CartItemDto, OwnerBatchDto} from "./DTO/OwnerBatchDto";
import {getUser} from "../user/UserService";
import {CartDto} from "./DTO/CartDto";
import {findOwnerForItem, getItemById} from "../item/ItemRepository";
import {sum} from "ramda";
import {CartOwnerBatch} from "./domain/CartOwnerBatch";

export const getCartItemCountFor = async (renterId: string) => {
    return sum(await getCartItemsQuantitiesFor(renterId));
}

export const getCartForUser = async (renterId: string): Promise<CartDto> => {
    const cart = await getCartItemsFor(renterId);

    const ownerBatches = Promise.all<OwnerBatchDto>(cart.ownerBatches.map(
        async (ownerBatch: CartOwnerBatch): Promise<OwnerBatchDto> => {
            const user = await getUser(ownerBatch.ownerId);
            const cartItemDtos = ownerBatch.cartItems.map(
                async cartItem => {
                    const borrowerItem = await getItemById(cartItem.id);
                    return new CartItemDto(
                        cartItem.id,
                        borrowerItem.title,
                        borrowerItem.rentalDailyPrice,
                        borrowerItem.imageUrl,
                        cartItem.quantity,
                        borrowerItem.canBeDelivered,
                        borrowerItem.deposit
                    )
                });

            return new OwnerBatchDto(
                user.name,
                user.email,
                await Promise.all(cartItemDtos)
            )
        }));

    return new CartDto(await ownerBatches);
};

export const addItemToCartForUser = async (userId: string, itemId: string) => {
    const cart = await getCartItemsFor(userId);

    const ownerId = await findOwnerForItem(itemId);
    cart.addItem(itemId, ownerId);

    return await updateCart(userId, CartMapper.toDao(cart));
};

export const removeSingleItemFromCart = async (userId: string, itemId: string) => {
    const cart = await getCartItemsFor(userId);

    const ownerId = await findOwnerForItem(itemId);
    cart.removeItem(itemId, ownerId);

    return await updateCart(userId, CartMapper.toDao(cart));
};

export const removeAllInstanceOfItemFromCart = async (userId: string, itemId: string) => {
    const cart = await getCartItemsFor(userId);

    const ownerId = await findOwnerForItem(itemId);
    cart.removeAllInstanceOfItem(itemId, ownerId);

    return await updateCart(userId, CartMapper.toDao(cart));
};
