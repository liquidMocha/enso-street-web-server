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
        `ALTER TABLE public."user" ALTER COLUMN id DROP DEFAULT;`
    );

    db.runSql(
        `ALTER TABLE user_profile ALTER COLUMN id DROP DEFAULT;`
    );

    db.runSql(
        `ALTER TABLE location ALTER COLUMN id DROP DEFAULT;`
    );

    db.runSql(
        `ALTER TABLE item ALTER COLUMN id DROP DEFAULT;`
        , callback);
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    "version": 1
};
