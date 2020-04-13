export default class SearchResultItem {
    private id: string;
    private city: string;
    private imageUrl: string;
    private title: string;
    private dailyRentalPrice: number;
    private zipCode: string;

    constructor(
        {id, city, imageUrl, title, dailyRentalPrice, zipCode}: { id: string, city: string, imageUrl: string, title: string, dailyRentalPrice: number, zipCode: string }
    ) {
        this.id = id;
        this.city = city;
        this.imageUrl = imageUrl;
        this.title = title;
        this.dailyRentalPrice = dailyRentalPrice;
        this.zipCode = zipCode;
    }
}
