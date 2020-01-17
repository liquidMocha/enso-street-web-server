import algoliasearch from 'algoliasearch';

const client = algoliasearch(process.env.ALGOLIASEARCH_APPLICATION_ID || 'dummy', process.env.ALGOLIASEARCH_API_KEY || 'dummy');
const searchIndex = client.initIndex(process.env.ALGOLIA_ITEM_INDEX || 'dummy');

searchIndex.setSettings({
    searchableAttributes: [
        'unordered(title)',
        'unordered(categories)',
        'description'
    ]
});

export default searchIndex;
