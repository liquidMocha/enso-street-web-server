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
                CREATE TABLE contact
                (
                    first_name      varchar(100),
                    last_name       varchar(100),
                    phone           varchar(30),
                    email           varchar(76),
                    user_profile_id UUID REFERENCES public.user_profile (id)
                )
        `
        , callback)
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    "version": 1
};
