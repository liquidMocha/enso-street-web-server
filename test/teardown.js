import database from "../database";

after(async () => {
    await database.none(`DROP SCHEMA public CASCADE;`);
    await database.none(`CREATE SCHEMA public`);
});
