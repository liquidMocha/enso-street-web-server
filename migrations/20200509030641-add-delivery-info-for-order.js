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
        ALTER TABLE "order"
            ADD COLUMN delivery_coordinates geography,
            ADD COLUMN delivery_fee         NUMERIC(12, 2),
            ADD COLUMN street               VARCHAR(128),
            ADD COLUMN city                 VARCHAR(45),
            ADD COLUMN state                VARCHAR(20),
            ADD COLUMN zip_code             VARCHAR(15);

    `, callback);
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    "version": 1
};
