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
    db.runSql(`
       CREATE TYPE order_status AS ENUM (
        'FUND_NOT_AUTHORIZED',
        'PENDING',
        'CONFIRMED',
        'EXPIRED',
        'CANCELLED',
        'COMPLETED'
    );
    `);
    db.runSql(`
        CREATE TABLE "order"
        (
            id                UUID PRIMARY KEY,
            payment_intent_id varchar(50),
            start_time        timestamp with time zone,
            return_time       timestamp with time zone,
            status            order_status,
            created_on        timestamp with time zone DEFAULT now()
        );
    `, callback);

    db.runSql(`
        CREATE TABLE order_item
        (
            order_id UUID REFERENCES "order" (id),
            item_id  UUID REFERENCES item (id),
            quantity integer
        );
    `)
};

exports.down = function (db, callback) {
    db.dropTable('order_item', callback);
    db.dropTable('order', callback);
    db.runSql('drop type order_status;', callback);
};

exports._meta = {
    "version": 1
};
