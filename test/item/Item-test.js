import {Item} from "../../src/item/Item";
import {expect} from "chai";

describe('item domain object', () => {
    it('archives item', () => {
        const subject = new Item({
            archived: false
        });

        subject.archive();

        expect(subject.archived).to.equal(true);
    })

})
