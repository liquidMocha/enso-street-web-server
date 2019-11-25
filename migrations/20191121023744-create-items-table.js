'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function (db, callback) {
    db.runSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    db.runSql(
        'CREATE TABLE public.condition (' +
        'id INTEGER PRIMARY KEY,' +
        'condition VARCHAR(15)' +
        ');');

    db.runSql(
        "INSERT INTO public.condition (id, condition) VALUES (1, 'like-new'), (2, 'normal-wear'), (3, 'functional');");

    //The longest place name in the United States (45 letters) is
    // Chargoggagoggmanchauggagoggchaubunagungamaugg, a lake in Webster, Massachusetts
    db.runSql(
            `CREATE TABLE public.location
             (
                 id         UUID PRIMARY KEY         DEFAULT uuid_generate_v4(),
                 street     VARCHAR(128),
                 zipCode    VARCHAR(15),
                 city       VARCHAR(45),
                 state      VARCHAR(2),
                 created_on timestamp with time zone DEFAULT now(),
                 "user"     UUID REFERENCES public.user (id)
             );`
    );

    db.runSql(
        'CREATE TABLE public.item (' +
        'id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),' +
        'title VARCHAR(128),' +
        'rentalDailyPrice decimal(12,2),' +
        'deposit decimal(12,2),' +
        'condition INTEGER REFERENCES condition(id),' +
        'description VARCHAR(2500), ' +
        'canBeDelivered boolean,' +
        'deliveryStarting decimal(12,2),' +
        'deliveryAdditional decimal(12,2),' +
        'location UUID REFERENCES location(id),' +
        'owner UUID REFERENCES public.user(id),' +
        'created_on timestamp with time zone DEFAULT now()' +
        ');', callback);

    db.runSql(
        'CREATE TABLE public.category (' +
        'id SERIAL PRIMARY KEY,' +
        'name VARCHAR(50)' +
        ');'
    );

    db.runSql(
        "INSERT INTO public.category (name) VALUES " +
        "('baby-and-kids')," +
        "('business-equipment')," +
        "('diy-home-improvement')," +
        "('farming')," +
        "('free')," +
        "('garden-and-patio')," +
        "('home-maintenance')," +
        "('music-instruments')," +
        "('novelty-electronics');"
    );

    db.runSql(
        'CREATE TABLE public.itemToCategory (' +
        'categoryId INTEGER REFERENCES public.category(id),' +
        'itemId UUID REFERENCES public.item(id)' +
        ');'
    );
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    "version": 1
};
