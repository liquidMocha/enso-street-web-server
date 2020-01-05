import ItemRepository from "./ItemRepository";
import HereApiClient from "../location/HereApiClient";

export default class ItemDAO {
    constructor({
                    id: id,
                    title: title,
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
        this.rentalDailyPrice = rentalDailyPrice;
        this.deposit = deposit;
        this.condition = condition;
        this.categories = categories;
        this.description = description;
        this.canBeDelivered = canBeDelivered;
        this.deliveryStarting = deliveryStarting;
        this.deliveryAdditional = deliveryAdditional;
        this.location = location;
        this.ownerEmail = user;
        this.searchable = searchable;
    }

    static fromDTO(itemDTO) {
        const addressCoordinates = ItemDAO.lookupCoordinatesFrom(itemDTO.location);

        return addressCoordinates.then(({latitude, longitude}) => {
            return new ItemDAO({
                title: itemDTO.title,
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

    static lookupCoordinatesFrom = (location) => {
        const street = `${location.street ? (location.street + ', ') : ''}`;
        const city = `${location.city ? (location.city + ', ') : ''}`;
        const state = `${location.state ? (location.state + ', ') : ''}`;
        const zipCode = `${location.zipCode ? (location.zipCode) : ''}`;
        const addressString = `${street}${city}${state}${zipCode}`;
        return HereApiClient.geocode(addressString);
    };

    update = (updatedItem) => {
        let coordinates;
        if (updatedItem.location) {
            coordinates = ItemDAO.lookupCoordinatesFrom(updatedItem.location);
        } else {
            coordinates = Promise.resolve({});
        }

        return coordinates.then(({latitude, longitude}) => {
            return ItemRepository.updateItem({
                ...updatedItem,
                id: this.id,
                location:
                    {
                        ...updatedItem.location,
                        latitude: latitude,
                        longitude: longitude
                    }
            });
        });
    };

    save = () => {
        return ItemRepository.save(this);
    };

    archive = (deleterEmail) => {
        if (deleterEmail === this.ownerEmail) {
            return ItemRepository.archive(this.id);
        } else {
            throw new Error(`User ${deleterEmail} does not own the item.`)
        }
    };
}