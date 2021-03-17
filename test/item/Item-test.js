import {Item} from "../../src/item/Item";
import {expect} from "chai";
import UpdateItem from "../../src/item/UpdateItem";

describe('item domain object', () => {
    it('archives item', () => {
        const subject = new Item({
            archived: false
        });

        subject.archive();

        expect(subject.archived).to.equal(true);
    });

    describe('updates item', () => {
        describe('categories', () => {
            it('should update categories when new categories is not empty', () => {
                const subject = new Item({
                    categories: ["farming"]
                });

                const newCategories = ["baby-and-kids"];
                subject.update(new UpdateItem({categories: newCategories}));

                expect(subject.categories).to.equal(newCategories)
            });

            it('should not update categories when new categories is empty', () => {
                const oldCategories = ["farming"];
                const subject = new Item({
                    categories: oldCategories
                });

                const newCategories = [];
                subject.update(new UpdateItem({categories: newCategories}));

                expect(subject.categories).to.equal(oldCategories)
            });
        });
    });

})
