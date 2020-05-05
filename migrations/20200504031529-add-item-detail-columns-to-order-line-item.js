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
        ALTER TABLE order_item
            RENAME TO order_line_item;
    `, callback);

    db.runSql(`
        ALTER TABLE order_line_item
            ADD COLUMN title               VARCHAR(128),
            ADD COLUMN description         VARCHAR(2500),
            ADD COLUMN image_url           VARCHAR(2000),
            ADD COLUMN rental_daily_price  NUMERIC(12, 2),
            ADD COLUMN deposit             NUMERIC(12, 2),
            ADD COLUMN condition           INTEGER,
            ADD COLUMN can_be_delivered    BOOLEAN,
            ADD COLUMN delivery_starting   NUMERIC(12, 2),
            ADD COLUMN delivery_additional NUMERIC(12, 2),
            ADD COLUMN street              VARCHAR(128),
            ADD COLUMN city                VARCHAR(45),
            ADD COLUMN state               VARCHAR(20),
            ADD COLUMN zip_code            VARCHAR(15),
            ADD COLUMN coordinates         geography
    `)
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    "version": 1
};
