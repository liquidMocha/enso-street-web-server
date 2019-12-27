import database from '../database';

export default class CategoryRepository {
    static getAllCategories = () => {
        return database.many(`SELECT name
                              FROM public.category;`)
    };
}