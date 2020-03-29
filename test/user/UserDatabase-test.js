import database from "../../database";
import UserRepository from "../../user/UserRepository";
import {create} from "../../user/UserFactory";
import {setupUser} from "../TestHelper";

const {expect} = require('chai');

describe('User data', () => {
    afterEach(() => {
        database.none('truncate public.user cascade;');
        database.none('truncate public.user_profile cascade;');
    });

    describe('findOne', () => {
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

            const actual = await UserRepository.findOne({email: expectedEmail});

            expect(actual.email).to.equal(expectedEmail);
            expect(actual.password).to.equal(expectedPassword);
            expect(actual.failedAttempts).to.equal(expectedFailedLoginAttempts);
            expect(actual.profile.name).to.equal(expectedName);
        });

        it('should return user if found by email; but profile doesn\'t exist', async () => {
            const expectedEmail = 'abc@123.com';
            const expectedPassword = 'some password';
            await setupUser({email: expectedEmail, password: expectedPassword});

            await UserRepository.findOne({email: expectedEmail})
                .then(userEntity => {
                    expect(userEntity).not.to.be.null;
                })
                .catch(error => {
                    expect.fail(error);
                });
        });

        it('should return null if no user found using email', async () => {
            const existingEmail = 'abc@123.com';
            await setupUser({email: existingEmail, password: "expectedPassword"});

            await UserRepository.findOne({email: 'wrong email'})
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

            const userEntity = await UserRepository.findOne({email: expectedEmail.toUpperCase()});

            expect(userEntity).not.to.be.null;
        })
    });

    //TODO: bug here. If user sign up through Enso street first and then google, they will be
    //logged into google sign up user's account
    describe('findOrCreate', () => {
        it('should return user when found by email', async () => {
            const expectedEmail = 'email@123.org';
            const expectedName = 'Jim Helpert';
            await setupUser({email: expectedEmail, name: expectedName});

            const user = create(expectedName, "", expectedEmail);
            const actualUser = await UserRepository.findOrCreate(user);

            expect(actualUser.email).to.equal(expectedEmail);
            expect(actualUser.profile.name).to.equal(expectedName);
        });

        it('should create new user if not found', async () => {
            const expectedEmail = 'abc@dundermifflin.com';
            const expectedName = 'Erin Hannen';

            const user = create(expectedName, null, expectedEmail);
            await UserRepository.findOrCreate(user);

            const createdUser = await database.one('select * from public.user where email = $1', expectedEmail);
            expect(createdUser.email).to.equal(expectedEmail);
        });

        it('should return created user if no user found', async () => {
            const expectedEmail = 'abc@dundermifflin.com';
            const expectedName = 'Erin Hannen';

            const userToBeSaved = create(expectedName, null, expectedEmail);
            const user = await UserRepository.findOrCreate(userToBeSaved);

            expect(user.email).to.equal(expectedEmail);
            expect(user.profile.name).to.equal(expectedName);
        })
    });

    describe('create enso user', () => {
        it('should throw exception if found existing user', async () => {
            const existingEmail = 'existing@email.com';
            await setupUser({email: existingEmail});

            const userToBeRejected = create("someName", "password", existingEmail);

            await UserRepository.saveEnsoUser(userToBeRejected)
                .catch(error => {
                    expect(error.message).to.contains('Account Exists')
                })
        });

        it('should create user if no user with same email exists', async () => {
            const expectedEmail = 'abc@dundermifflin.com';
            const expectedName = 'Erin Hannen';

            const userToBeSaved = create(expectedName, "password", expectedEmail);
            await UserRepository.saveEnsoUser(userToBeSaved)
                .then(() => {
                    return database.one('select * from public.user where email = $1', expectedEmail);
                })
                .then(user => {
                    expect(user.email).to.equal(expectedEmail);
                    expect(user.password).not.to.be.empty;
                })
                .catch((error) => {
                    expect.fail(error);
                })
        })
    });

    describe('track failed login attempts', () => {
        const email = 'some@email.com';
        const failedLoginAttempts = 3;

        it('should update user', async () => {
            await setupUser({email});

            const user = create("", "", email);
            user.failedAttempts = failedLoginAttempts;

            await UserRepository.update(user);

            const data = await database.one(`
                SELECT failed_login_attempts
                FROM public.user
                WHERE email = $1;`, email);

            expect(data.failed_login_attempts).to.equal(failedLoginAttempts);
        });
    });

});
