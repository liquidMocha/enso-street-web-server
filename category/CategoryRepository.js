import database from '../database';

export default class CategoryRepository {
    static getAllCategories = () => {
        return database.many(`select name
                              from public.category;`)
    }
}