import searchIndex from "./AlgoliaConfig";
import {Item} from "../item/Item";
import {Coordinates} from "../location/Coordinates";
import {SearchItemHit} from "./SearchItemHit";

const indexItem = (item: Item) => {
    const itemToBeIndexed = {
        objectID: item.id,
        title: item.title,
        description: item.description,
        categories: item.categories,
        _geoloc: {
            lat: item.location.coordinates.latitude,
            lng: item.location.coordinates.longitude
        }
    };

    return searchIndex.saveObject(itemToBeIndexed);
};

const searchByLocation = async (keyWord: string, coordinates: Coordinates): Promise<SearchItemHit[]> => {
    const response = await searchIndex.search(
        keyWord,
        {aroundLatLng: `${coordinates.latitude}, ${coordinates.longitude}`}
    );

    return response.hits.map(hit => {
        return new SearchItemHit(hit.objectID);
    });
};

const updateItemIndex = (item: Item) => {
    return searchIndex.partialUpdateObject({
        objectID: item.id,
        title: item.title,
        description: item.description,
        categories: item.categories,
        _geoloc: {
            lat: item.location.coordinates.latitude,
            lng: item.location.coordinates.longitude
        }
    }, {createIfNotExists: true});
};

const deleteItemIndex = (item: Item) => {
    if (item.id) {
        return searchIndex.deleteObject(item.id)
    } else {
        throw new Error("Attempting to delete index of item with null ID")
    }
};

export default {
    indexItem,
    searchByLocation,
    updateItemIndex,
    deleteItemIndex
}
