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
        'CREATE TABLE public.user (' +
        'id     UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),' +
        'password VARCHAR(76),' +
        'email  VARCHAR(76) NOT NULL,' +
        'created_on timestamp with time zone DEFAULT now() ' +
        ')', callback);

    db.runSql(
        'CREATE TABLE user_profile (' +
        'id     UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),' +
        'name   VARCHAR(254),' +
        'created_on timestamp with time zone DEFAULT now(),' +
        'user_id UUID REFERENCES public.user(id)' +
        ');'
    );
};

exports.down = function (db, callback) {
    db.dropTable('user_profile', callback);
    db.dropTable('public.user', callback);
};

exports._meta = {
  "version": 1
};
