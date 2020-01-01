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
            `ALTER TABLE public.item
                ADD COLUMN street  VARCHAR(128),
                ADD COLUMN zipCode VARCHAR(15),
                ADD COLUMN city    VARCHAR(45),
                ADD COLUMN state   VARCHAR(2)`, callback
    );

    db.runSql(
            `ALTER TABLE public.item
                DROP COLUMN location`)
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    "version": 1
};
