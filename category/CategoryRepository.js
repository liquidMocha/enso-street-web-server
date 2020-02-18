import database from '../database';

export const getAllCategories = () => {
    return database.many(`SELECT name
                          FROM public.category;`)
};

export const getItemCountForCategory = (category) => {
    return database
        .one(`SELECT count(item.id)
              FROM item
                       JOIN itemtocategory i ON item.id = i.itemid
                       JOIN category c on i.categoryid = c.id
              WHERE c.name = $1`, [category],
            result => Number(result.count));
};
