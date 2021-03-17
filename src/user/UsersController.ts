import {
    createEnsoUser,
    ensoLogin,
    googleSignOn,
    initiateForgetPassword,
    passwordMatch,
    updatePasswordFor,
    userExists
} from "./UserService";
import express, {Request, Response} from "express";
import {OAuth2Client} from "google-auth-library";
import Joi from "@hapi/joi";
import UserRepository from "./UserRepository";
import {UserProfile} from "../userprofile/UserProfile";
import {save as saveUserProfile} from "../userprofile/UserProfileRepository";
import {createNewEnsoUser} from "./UserFactory";
import jose from "jose";
import {requireAuthentication} from "./AuthenticationCheck";
import {getStripeConnectAccount} from "../stripe/StripeClient";

const CLIENT_ID = process.env.googleClientId;
const googleOAuthClient = new OAuth2Client(CLIENT_ID);

const router = express.Router();

router.post('/connect-stripe', requireAuthentication, connectStripe);
router.post('/update-password', requireAuthentication, updatePassword);
router.get('/logout', requireAuthentication, logout);
router.post('/createUser', registerEnsoUser);
router.post('/login', login);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.post('/googleSignOn', googleSignOnEndpoint);
router.post('/isLoggedIn', isUserLoggedIn);

async function updatePassword(req: Request, res: Response) {
    const userId = req.session?.userId;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const existingPassword = UserRepository.getPasswordHashForUser(userId);
    const existingPasswordMatch = await passwordMatch(currentPassword, await existingPassword);
    if (existingPasswordMatch) {
        await updatePasswordFor(userId, newPassword);
        res.status(200).send();
    } else {
        res.status(401).send();
    }
}

async function connectStripe(req: Request, res: Response) {
    try {
        const stripeAuthorizationCode = req.body.stripeAuthorizationCode;

        const stripeConnectAccountId = getStripeConnectAccount(stripeAuthorizationCode);
        const userId = req.session?.userId;

        const user = await UserRepository.getUserById(userId);
        user.stripeUserId = await stripeConnectAccountId;
        await UserRepository.update(user);
        res.status(200).send();
    } catch (e) {
        console.trace(e);
        res.status(500).send();
    }
}

async function registerEnsoUser(req: Request, res: Response) {
    const schema = Joi.object({
        email: Joi.any(),
        name: Joi.any(),
        password: Joi.string().min(8)
    });

    try {
        const validatedValue = await schema.validateAsync(req.body);

        const userAlreadyExists = await UserRepository.emailExists(validatedValue.email);
        if (userAlreadyExists) {
            res.status(409).send();
        } else {
            await createEnsoUser(
                validatedValue.name,
                validatedValue.password,
                validatedValue.email
            );
            res.status(201).send();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
}

async function login(req: Request, res: Response) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const loginUserId = await ensoLogin(email, password);

        if (loginUserId) {
            req!.session!.userId = loginUserId;
            res.status(200).send('authentication successful');
        } else {
            res.status(401).send('authentication failed');
        }
    } catch (e) {
        console.error(`Error when try to log in ${email}: ${e}`);
        res.status(500);
    }
}

async function googleSignOnEndpoint(req: Request, res: Response) {
    try {
        const response = await googleSignOn(req.body.idToken);
        const user = createNewEnsoUser(response.email);

        if (await UserRepository.oAuthUserExists(user.email)) {
            const existingUser = UserRepository.findOneUser({email: user.email})
            req!.session!.userId = (await existingUser)?.id;
            res.status(200).send();
        } else {
            if (await UserRepository.ensoUserExists(user.email)) {
                res.status(409).send();
            } else {
                const userProfile = UserProfile.create(response.name, user.email, user);

                await UserRepository.createOAuthUser(user)
                await saveUserProfile(userProfile, user)
                res.status(200).send();
            }
        }
    } catch (e) {
        console.error(`Error when Google sign on: ${e}`);
        res.status(500).send();
    }
}

async function isUserLoggedIn(req: Request, res: Response) {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    const userId = req.session?.userId;

    if (userId) {
        const isLoggedIn = await userExists(userId);
        res.status(200).json({loggedIn: isLoggedIn});
    } else {
        res.status(200).json({loggedIn: false});
    }
}

async function logout(req: Request, res: Response) {
    console.log(`User ${req.session?.userId} logging out.`);

    req.session?.destroy(error => {
        if (error) {
            console.error(error);
        }
    });
    res.status(200).send();
}

async function forgetPassword(req: Request, res: Response) {
    const userEmail = req.body.email;
    try {
        await initiateForgetPassword(userEmail);
        res.status(200).send();
    } catch (e) {
        console.error(e);
        res.status(500).send();
    }
}

async function resetPassword(req: Request, res: Response) {
    const newPassword = req.body.password;
    const token = req.body.token;
    try {
        const decodedToken = jose.JWT.decode(token);
        // @ts-ignore
        const userId = decodedToken.id;

        const userPasswordHash = UserRepository.getPasswordHashForUser(userId);
        const tokenVerifyResult = jose.JWT.verify(token, await userPasswordHash);
        await updatePasswordFor(userId, newPassword);
        res.status(200).send();
    } catch (e) {
        console.error(`password reset token rejected: ${e}`)
    }
}

export default router;
