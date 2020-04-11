import searchIndex from "./AlgoliaConfig";

const indexItem = (item) => {
    const itemToBeIndexed = {
        objectID: item.id,
        title: item.title,
        description: item.description,
        categories: item.categories,
        _geoloc: {
            lat: item.latitude,
            lng: item.longitude
        }
    };

    searchIndex.addObject(itemToBeIndexed);
};

const searchByLocation = async (keyWord, {latitude, longitude}) => {
    try {
        const response = await searchIndex.search({
            query: keyWord,
            aroundLatLng: `${latitude}, ${longitude}`
        });

        return response.hits;
    } catch (e) {
        console.error('Errored when searching: ', e);
    }
};

const updateItemIndex = (item) => {
    searchIndex.partialUpdateObject({
        objectID: item.id,
        title: item.title,
        description: item.description,
        categories: item.categories,
        _geoloc: {
            lat: item.latitude,
            lng: item.longitude
        }
    });
};

const deleteItemIndex = (itemId) => {
    searchIndex.deleteObject(itemId);
};

export default {
    indexItem,
    searchByLocation,
    updateItemIndex,
    deleteItemIndex
}
