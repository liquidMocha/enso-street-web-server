import {UserProfile} from "./UserProfile";
import {User} from "./User";
import {Cart} from "./cart/Cart";
import {CartItem} from "./cart/CartItem";

export const create = (name, password, email) => {
    return new User({
        password,
        email,
        profile: new UserProfile({name})
    })
};

export const reconstitueFromDao = ({userDao, cartDao}) => {
    return new User({
        id: userDao.userid,
        password: userDao.password,
        email: userDao.email,
        failedAttempts: userDao.failed_login_attempts,
        profile: new UserProfile({name: userDao.name}),
        cart: new Cart({
            cartItems: cartDao.map(item => new CartItem({
                itemId: item.id, quantity: item.quantity
            }))
        })
    });
};
