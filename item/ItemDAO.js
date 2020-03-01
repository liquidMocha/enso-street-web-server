import {geocode} from "../location/HereApiClient";
import Index from "../search/Index";
import {archive, save, updateItem} from "./ItemRepository";

export class ItemDAO {
    constructor({
                    id: id,
                    title: title,
                    imageUrl: imageUrl,
                    rentalDailyPrice: rentalDailyPrice,
                    deposit: deposit,
                    condition: condition,
                    categories: categories,
                    description: description,
                    canBeDelivered: canBeDelivered,
                    deliveryStarting: deliveryStarting,
                    deliveryAdditional: deliveryAdditional,
                    location: location,
                    ownerEmail: user,
                    searchable: searchable
                }) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.rentalDailyPrice = parseFloat(rentalDailyPrice);
        this.deposit = parseFloat(deposit);
        this.condition = condition;
        this.categories = categories;
        this.description = description;
        this.canBeDelivered = canBeDelivered;
        this.deliveryStarting = parseFloat(deliveryStarting);
        this.deliveryAdditional = parseFloat(deliveryAdditional);
        this.location = location;
        this.ownerEmail = user;
        this.searchable = searchable;
    }

    static fromDTO(itemDTO) {
        const addressCoordinates = ItemDAO.lookupCoordinatesFrom(itemDTO.location);

        return addressCoordinates.then(({latitude, longitude}) => {
            return new ItemDAO({
                title: itemDTO.title,
                imageUrl: itemDTO.imageUrl,
                rentalDailyPrice: itemDTO.rentalDailyPrice,
                deposit: itemDTO.deposit,
                condition: itemDTO.condition,
                categories: itemDTO.categories,
                description: itemDTO.description,
                canBeDelivered: itemDTO.canBeDelivered,
                deliveryStarting: itemDTO.deliveryStarting,
                deliveryAdditional: itemDTO.deliveryAdditional,
                location: {...itemDTO.location, latitude, longitude},
                ownerEmail: itemDTO.userEmail,
                searchable: itemDTO.searchable
            });
        }).catch(error => {
            console.log(`Error when converting item to DAO: ${error}`);
        });
    }

    toDTO = () => {
        return {
            id: this.id,
            title: this.title,
            rentalDailyPrice: this.rentalDailyPrice,
            imageUrl: this.imageUrl
        }
    };

    static lookupCoordinatesFrom = (location) => {
        const street = `${location.street ? (location.street + ', ') : ''}`;
        const city = `${location.city ? (location.city + ', ') : ''}`;
        const state = `${location.state ? (location.state + ', ') : ''}`;
        const zipCode = `${location.zipCode ? (location.zipCode) : ''}`;
        const addressString = `${street}${city}${state}${zipCode}`;
        return geocode(addressString);
    };

    update = async (updatedItem) => {
        let coordinates;
        if (updatedItem.location) {
            coordinates = ItemDAO.lookupCoordinatesFrom(updatedItem.location);
            updatedItem.location = {
                ...updatedItem.location,
                ...await coordinates
            };
        }

        const savedItem = await updateItem({
            ...updatedItem,
            id: this.id,
        });

        if (savedItem[1].searchable) {
            Index.updateItemIndex({
                id: savedItem[1].id,
                title: savedItem[1].title,
                description: savedItem[1].description,
                latitude: savedItem[1].latitude,
                longitude: savedItem[1].longitude,
                categories: savedItem[0]
            });
        } else {
            Index.deleteItemIndex(savedItem[1].id);
        }
    };

    save = async () => {
        const itemSaved = await save(this);

        try {
            Index.indexItem(itemSaved);
        } catch (e) {
            console.error(e);
        }

        return itemSaved;
    };

    archive = async (deleterEmail) => {
        if (deleterEmail === this.ownerEmail) {
            await archive(this.id);
            Index.deleteItemIndex(this.id);
        } else {
            throw new Error(`User ${deleterEmail} does not own the item.`)
        }
    };
}
