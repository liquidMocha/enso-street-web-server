import database from "../../database";
import UserRepository from "../../user/UserRepository";

const {expect} = require('chai');

describe('UserService', () => {
    afterEach(() => {
        database.none('truncate public.user cascade;');
        database.none('truncate public.user_profile cascade;');
    });

    async function setupUser({email: email, password: password, name: name}) {
        const data = await database.one('insert into public.user(email, password) values($1, $2) returning id', [email, password]);
        if (name) {
            await database.none('insert into public.user_profile(name, user_id) values($1, $2)', [name, data.id]);
        }
    }

    describe('findOne', () => {
        it('should return user entity if found a user', async () => {
            const expectedEmail = 'abc@123.com';
            const expectedPassword = 'some password';
            const expectedName = 'Pam Helpert';
            await setupUser({email: expectedEmail, password: expectedPassword, name: expectedName});

            await UserRepository.findOne({email: expectedEmail})
                .then(userEntity => {
                    expect(userEntity.email).to.equal(expectedEmail);
                    expect(userEntity.password).to.equal(expectedPassword);
                    expect(userEntity.profile.name).to.equal(expectedName);
                })
                .catch(error => {
                    expect.fail(error);
                });
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

        it('should return null if none user found using email', async () => {
            const existingEmail = 'abc@123.com';
            await setupUser({email: existingEmail});

            await UserRepository.findOne({email: 'wrong email'})
                .then(user => {
                    expect(user).to.be.null;
                })
                .catch(error => {
                    expect.fail(error);
                });
        });
    });

    describe('findOrCreate', () => {
        it('should return user when found by email', async () => {
            const expectedEmail = 'email@123.org';
            const expectedName = 'Jim Helpert';
            await setupUser({email: expectedEmail, name: expectedName});

            await UserRepository.findOrCreate({email: expectedEmail})
                .then(user => {
                    expect(user.email).to.equal(expectedEmail);
                    expect(user.profile.name).to.equal(expectedName);
                })
                .catch(error => {
                    expect.fail(error);
                });
        });

        it('should create new user if not found', async () => {
            const expectedEmail = 'abc@dundermifflin.com';
            const expectedName = 'Erin Hannen';

            await UserRepository.findOrCreate({email: expectedEmail, name: expectedName})
                .then(() => {
                    return database.one('select * from public.user where email = $1', expectedEmail)
                })
                .then(user => {
                    expect(user.email).to.equal(expectedEmail);
                })
                .catch(error => {
                    expect.fail(error);
                });
        });

        it('should return created user if no user found', async () => {
            const expectedEmail = 'abc@dundermifflin.com';
            const expectedName = 'Erin Hannen';

            const user = await UserRepository.findOrCreate({email: expectedEmail, name: expectedName});
            expect(user.email).to.equal(expectedEmail);
            expect(user.profile.name).to.equal(expectedName);
        })
    });

    describe('create enso user', () => {
        it('should throw exception if found existing user', async () => {
            const existingEmail = 'existing@email.com';
            await setupUser({email: existingEmail});

            await UserRepository.createEnsoUser("someName", "pass", existingEmail)
                .catch(error => {
                    expect(error.message).to.contains('Account Exists')
                })
        });

        it('should create user if no user with same email exists', async () => {
            const expectedEmail = 'abc@dundermifflin.com';
            const expectedName = 'Erin Hannen';

            await UserRepository.createEnsoUser(expectedName, "pass", expectedEmail)
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

        const shouldFailedOnce = async () => {
            await setupUser({email: email});

            await UserRepository.incrementFailedAttempt(email)
                .then(() => {
                    return database.one('select failed_login_attempts from public.user where email = $1;', email);
                })
                .then(data => {
                    expect(data.failed_login_attempts).to.equal(1);
                })
                .catch(error => expect.fail(error));
        };

        it('should increment failed sign in attempt', shouldFailedOnce);

        it('should not increment failed sign in attempt for other user', async () => {
            const failedUser = 'failed@email.com';
            await setupUser({email: failedUser});
            const irrelavantUser = 'notFailed@email.com';
            await setupUser({email: irrelavantUser});

            await UserRepository.incrementFailedAttempt(email)
                .then(() => {
                    return database.one('select failed_login_attempts from public.user where email = $1;', irrelavantUser);
                })
                .then(data => {
                    expect(data.failed_login_attempts).to.equal(0);
                })
                .catch(error => expect.fail(error));
        });

        it('should reset failed sign in attempt', async () => {
            await shouldFailedOnce();

            await UserRepository.resetFailedAttempts(email)
                .then(() => {
                    return database.one('select failed_login_attempts from public.user where email = $1;', email);
                })
                .then(data => {
                    expect(data.failed_login_attempts).to.equal(0);
                })
        });
    });

});