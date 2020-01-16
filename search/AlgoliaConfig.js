import algoliasearch from 'algoliasearch';

const client = algoliasearch(process.env.ALGOLIASEARCH_APPLICATION_ID, process.env.ALGOLIASEARCH_API_KEY);
const searchIndex = client.initIndex(process.env.ALGOLIA_ITEM_INDEX);

export default searchIndex;
