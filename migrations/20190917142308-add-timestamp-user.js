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

exports.up = function (db) {
    db.addColumn(
        'user', 'created_on', 'timestamp with time zone'
    );
    return null;
};

exports.down = function (db) {
    //Ignore since I don't want to think about downgrade
    return null;
};

exports._meta = {
    "version": 1
};
