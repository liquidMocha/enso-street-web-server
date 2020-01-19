import searchIndex from "./AlgoliaConfig";

export const indexItem = (item) => {
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

export const searchByLocation = async (keyWord, {latitude, longitude}) => {
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