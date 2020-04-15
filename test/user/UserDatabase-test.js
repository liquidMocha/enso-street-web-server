import database from "../../src/database.js";
import UserRepository from "../../src/user/UserRepository";
import {setupUser} from "../TestHelper";
import {User} from "../../src/user/User";
import {uuid} from "uuidv4";

const {expect} = require('chai');

describe('User data', () => {
    afterEach(() => {
        database.none('truncate public.user cascade;');
        database.none('truncate public.user_profile cascade;');
    });

    describe('get email by ID', () => {
        it('should find user email given user ID', async () => {
            const userId = uuid();
            const userEmail = "abc@123";
            const password = "123456";
            const user = User.create({id: userId, email: userEmail})

            await UserRepository.saveEnsoUser(user, password);

            const actual = await UserRepository.getEmailById(userId);

            expect(actual).to.equal(userEmail);
        });
    })

    describe('findOneUser', () => {
        it('should return user entity if found a user', async () => {
            const expectedEmail = 'abc@123.com';
            const expectedPassword = 'some password';
            const expectedName = 'Pam Helpert';
            const expectedFailedLoginAttempts = 1;
            await setupUser({
                email: expectedEmail,
                password: expectedPassword,
                name: expectedName,
                failedLoginAttempts: expectedFailedLoginAttempts
            });

            const actual = await UserRepository.findOneUser({email: expectedEmail});

            expect(actual.email).to.equal(expectedEmail);
            expect(actual.failedAttempts).to.equal(expectedFailedLoginAttempts);
        });

        it('should return null if no user found using email', async () => {
            const existingEmail = 'abc@123.com';
            await setupUser({email: existingEmail, password: "expectedPassword"});

            await UserRepository.findOneUser({email: 'wrong email'})
                .then(user => {
                    expect(user).to.be.null;
                })
                .catch(error => {
                    expect.fail(error);
                });
        });

        it('should look for user by case INSENSITIVE email', async () => {
            const expectedEmail = 'abc@123.com';
            const expectedPassword = 'some password';
            await setupUser({email: expectedEmail, password: expectedPassword});

            const userEntity = await UserRepository.findOneUser({email: expectedEmail.toUpperCase()});

            expect(userEntity).not.to.be.null;
        })
    });

    describe('oAuthUserExists', () => {
        it('should return true when an oauth user exists', async () => {
            const oAuthUserEmail = "123@abc";
            const user = User.create({id: uuid(), email: oAuthUserEmail})
            await UserRepository.createOAuthUser(user);

            const actual = await UserRepository.oAuthUserExists(oAuthUserEmail)

            expect(actual).to.be.equal(true);
        })

        it('should return false when an Enso User with the same email exists', async () => {
            const ensoUserEmail = "123@abc";
            const user = User.create({id: uuid(), email: ensoUserEmail})
            await UserRepository.saveEnsoUser(user, "some-pass");

            const actual = await UserRepository.oAuthUserExists(ensoUserEmail)

            expect(actual).to.be.equal(false);
        })
    })

    describe('ensoUserExists', () => {
        it('should return false when an oauth user exists', async () => {
            const oAuthUserEmail = "123@abc";
            const user = User.create({id: uuid(), email: oAuthUserEmail})
            await UserRepository.createOAuthUser(user);

            const actual = await UserRepository.ensoUserExists(oAuthUserEmail)

            expect(actual).to.be.equal(false);
        })

        it('should return true when an Enso User with the same email exists', async () => {
            const ensoUserEmail = "123@abc";
            const user = User.create({id: uuid(), email: ensoUserEmail})
            await UserRepository.saveEnsoUser(user, "some-pass");

            const actual = await UserRepository.ensoUserExists(ensoUserEmail)

            expect(actual).to.be.equal(true);
        })
    })

    describe('email exists', () => {
        it('should return true when an Enso user exists with email', async () => {
            const ensoEmail = "123@abc";
            const ensoUser = User.create({id: uuid(), email: ensoEmail})
            await UserRepository.saveEnsoUser(ensoUser, "pass");

            const actual = await UserRepository.emailExists(ensoEmail)

            expect(actual).to.be.equal(true);
        })

        it('should return true when an OAuth user exists with email', async () => {
            const oAuthUserEmail = "123@abc";
            const user = User.create({id: uuid(), email: oAuthUserEmail})
            await UserRepository.createOAuthUser(user);

            const actual = await UserRepository.emailExists(oAuthUserEmail)

            expect(actual).to.be.equal(true);
        })

        it('should return false when user with email doesn\'t exist', async () => {
            const actual = await UserRepository.emailExists('non-existing@email')

            expect(actual).to.be.equal(false);
        })
    })

    describe('userExists', () => {
        it('should return true when user with ID exists', async () => {
            const oAuthUserEmail = "123@abc";
            const userId = uuid();
            const user = User.create({id: userId, email: oAuthUserEmail})
            await UserRepository.createOAuthUser(user);

            const actual = await UserRepository.userExists(userId)

            expect(actual).to.be.equal(true);
        })

        it('should return false when user with ID does not exist', async () => {
            const oAuthUserEmail = "123@abc";
            const userId = uuid();
            const user = User.create({id: userId, email: oAuthUserEmail})
            await UserRepository.createOAuthUser(user);

            const actual = await UserRepository.userExists(uuid())

            expect(actual).to.be.equal(false);
        })
    })

    describe('saveEnsoUser', () => {
        it('should save user', async () => {
            const userId = uuid();
            const userEmail = "some@email";
            const password = "12345";
            const user = User.create({id: userId, email: userEmail})

            await UserRepository.saveEnsoUser(user, password);

            const actualUser = await UserRepository.findOneUser({email: userEmail});

            expect(actualUser.id).to.be.equal(userId);
            expect(actualUser.email).to.be.equal(userEmail);
            expect(actualUser.failedAttempts).to.be.equal(0);
        })

        it('should hash password', async () => {
            const password = "12345";
            const userId = uuid();
            const user = User.create({id: userId, email: "some@email"})

            await UserRepository.saveEnsoUser(user, password);

            const actualPassword = await UserRepository.getPasswordForUser(userId);

            expect(actualPassword).not.to.be.equal(password);
            expect(actualPassword).not.to.be.null;
        })
    })

    describe('saveOAuthUser', () => {
        it('should save user', async () => {
            const userEmail = 'some@email';
            const userId = uuid();
            const user = User.create({id: userId, email: userEmail});

            await UserRepository.createOAuthUser(user)

            const actualUser = await UserRepository.findOneUser({email: userEmail});

            expect(actualUser.id).to.be.equal(userId);
            expect(actualUser.email).to.be.equal(userEmail);
            expect(actualUser.failedAttempts).to.be.equal(0);
        })
    })

});
