const Json2csvParser = require('json2csv').Parser;
const db = require('../startup/db');
const shopify = require('../startup/shopify');


const SHOPIFY_LIMIT = 40;
const fields = ['sku', 'descr', 'qty', 'price', 'promo'];
const json2csvParser = new Json2csvParser({ fields, header: false });
let client;
let fileContent = [];
let counter = 0;

module.exports = {
    init: async function () {
        await db.init();
        client = db.client;
        await shopify.init();
    },
    createMissingProducts: async function () {
        const dataCursor = await db.findStoreRecords();
        await this._insertRecords(dataCursor, 'DB');

        if (!await dataCursor.hasNext()) {
            console.log('All records processed');
            //Wait 15 seconds for any async write processes before closing.
            setTimeout(() => client.close(), 15000);
        }
    },
    _insertRecords: async function (dataCursor, type) {
        try {
            for (let x = 0; x < SHOPIFY_LIMIT; x++) {
                if (await dataCursor.hasNext()) {
                    const stock_store = await dataCursor.next();
                    if (stock_store.qty > 0) {
                        if (stock_store.price > 0) {
                            const count = await db.siteRecordsCountBySku(stock_store.sku);
                            console.log(`stock_store: ${stock_store.sku}, ${stock_store.qty}, ${stock_store.price}, ${count}`);
                            if (count === 0) {
                                if (type === 'FILE') {
                                    fileContent.push(json2csvParser.parse(stock_store));
                                }
                                else {
                                    await shopify.createProduct(stock_store);
                                }
                                counter++;
                            }
                        }
                    }
                }
            }

            if (counter < 40) {
                console.log(`${counter} inserted.`)
                this._insertRecords(dataCursor, type);
            }
            else {
                counter = 0;
                if (await dataCursor.hasNext()) {
                    console.log('Pausing for Rate Limiter...')
                    if (type === 'FILE') {
                        console.log(fileContent.length);
                        if (fileContent.length >= 10)
                            return true;
                        else
                            setTimeout(() => this._insertRecords(dataCursor, type), 10000);
                    }
                    else
                        setTimeout(() => this._insertRecords(dataCursor, type), 10000);
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }
};