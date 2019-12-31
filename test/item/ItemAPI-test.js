import app from "../../app";
import request from "supertest";
import express from "express";
import sinon from "sinon";
import ItemRepository from "../../item/ItemRepository";
import HereApiClient from "../../location/HereApiClient";

describe.only('item API', () => {
    describe('create new item', () => {
        let saveItemStub;
        let geocodeStub;

        before(() => {
            saveItemStub = sinon
                .stub(ItemRepository, 'save')
                .returns(new Promise(((resolve, reject) => {
                    resolve('signed-request')
                })));

            geocodeStub = sinon
                .stub(HereApiClient, 'geocode')
                .returns(new Promise(((resolve, reject) => {
                        resolve({latitude: 12.34, longitude: 33.45})
                    })
                ));
        });

        beforeEach(() => {
            sinon.resetHistory();
        });

        after(() => {
            sinon.restore();
        });

        it('should respond with 401 when user is not authenticated', (done) => {
            request(app)
                .post('/api/items')
                .expect(401, (error) => {
                    return done(error);
                })
        });

        it('should save item', (done) => {
            const item = {
                title: 'item title',
                rentalDailyPrice: 20.61,
                deposit: 60.12,
                condition: 'like-new',
                categories: 'games-and-toys',
                description: 'this is a test item',
                canBeDelivered: true,
                deliveryStarting: 2.29,
                deliveryAdditional: 0.69,
                location: {
                    street: '1725 Slough Avenue',
                    city: 'scranton',
                    state: 'PA',
                    zipCode: 17870
                }
            };

            const testApp = express();
            testApp.use((req, res, next) => {
                req.session = {email: "someemail@enso.com"};
                next();
            });

            testApp.use(app);

            request(testApp)
                .post('/api/items')
                .send(item)
                .expect(201, (error, response) => {
                    sinon.assert.calledWith(geocodeStub, '1725 Slough Avenue, scranton, PA, 17870');
                    sinon.assert.calledWithMatch(saveItemStub, sinon.match({
                        ...item
                    }));
                    done();
                });
        })
    });
});
