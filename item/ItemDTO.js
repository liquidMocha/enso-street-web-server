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
                    imageUrl: imageUrl
                }) {
        this.id = id;
        this.title = title;
        this.rentalDailyPrice = rentalDailyPrice;
        this.deposit = deposit;
        this.condition = condition;
        this.categories = categories || [];
        this.description = description;
        this.canBeDelivered = canBeDelivered;
        this.deliveryStarting = deliveryStarting;
        this.deliveryAdditional = deliveryAdditional;
        this.location = location;
        this.userEmail = userEmail;
        this.imageUrl = imageUrl;
    }

    addCategory(category) {
        this.categories.push(category);
    }
}