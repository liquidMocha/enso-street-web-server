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
    ALTER TABLE public.contact
      ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    ALTER TABLE public.contact
      ALTER COLUMN id DROP DEFAULT;
  `, callback);

};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
