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
    db.runSql(
            `ALTER TABLE public."user"
                DROP COLUMN cart`
    );

    db.runSql(
            `CREATE TABLE cart
             (
                 renter   UUID REFERENCES public.user (id),
                 item     UUID REFERENCES public.item (id),
                 quantity INTEGER DEFAULT 0,
                 CONSTRAINT cart_pkey PRIMARY KEY (renter, item)
             );
        `, callback
    )
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    "version": 1
};
