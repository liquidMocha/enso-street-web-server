export default class ItemDTO {
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
                    userEmail: userEmail,
                    imageUrl: imageUrl,
                    createdOn: createdOn,
                    searchable: searchable
                }) {
        this.id = id;
        this.title = title;
        this.rentalDailyPrice = Number(rentalDailyPrice);
        this.deposit = Number(deposit);
        this.condition = condition;
        this.categories = categories || [];
        this.description = description;
        this.canBeDelivered = canBeDelivered;
        this.deliveryStarting = Number(deliveryStarting);
        this.deliveryAdditional = Number(deliveryAdditional);
        this.location = location;
        this.userEmail = userEmail;
        this.imageUrl = imageUrl;
        this.createdOn = createdOn;
        this.searchable = searchable;
    }

    addCategory(category) {
        this.categories.push(category);
    }
}
