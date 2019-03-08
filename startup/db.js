const MongoClient = require('mongodb').MongoClient;
const environment = require('./environment');

module.exports = {
    client: null,
    db: null,
    shopifyCollection: null,
    storeCollection: null,
    init: async function() {
        console.log(`SHOPIFY_DBURL: ${environment.SHOPIFY_DBURL}`);
        console.log(`SHOPIFY_DBNAME: ${environment.SHOPIFY_DBNAME}`);
        console.log(`SHOPIFY_COLLECTIONNAME: ${environment.SHOPIFY_COLLECTIONNAME}`);
        console.log(`STORE_COLLECTIONNAME: ${environment.STORE_COLLECTIONNAME}`);

        if (!this.client) {
            this.client = await MongoClient.connect(environment.SHOPIFY_DBURL);
            this.db = this.client.db(environment.SHOPIFY_DBNAME);
            this.shopifyCollection = this.db.collection(environment.SHOPIFY_COLLECTIONNAME);
            this.storeCollection = this.db.collection(environment.STORE_COLLECTIONNAME);
        }
        return this.shopifyCollection;
    },
    siteRecordsCountBySku: async function(sku) {
        return await this.shopifyCollection.countDocuments({"sku": `${sku}`});
    },
    findStoreRecords: async function() {
        return await this.storeCollection.find({});
    }
}
