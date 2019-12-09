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
            `INSERT INTO public.category (name)
             VALUES ('appliances'),
                    ('arts-and-crafts'),
                    ('audio-equipment'),
                    ('camping-and-outdoors'),
                    ('costumes-and-special-occasions'),
                    ('computer-equipment'),
                    ('exercise'),
                    ('furniture'),
                    ('games-and-toys'),
                    ('party-and-events'),
                    ('pet-supplies'),
                    ('photography'),
                    ('rare-find'),
                    ('sports'),
                    ('tools-and-machinery'),
                    ('video-equipment')
        `
        , callback)
};

exports.down = function (db) {
    return null;
};

exports._meta = {
    "version": 1
};
