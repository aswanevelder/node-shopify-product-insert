const Shopify = require('shopify-api-node');
const environment = require('./environment');
let shopify;

module.exports = {
    init: async function () {
        shopify = new Shopify({
            shopName: environment.SHOPIFY_SHOPNAME,
            apiKey: environment.SHOPIFY_APIKEY,
            password: environment.SHOPIFY_PASSWORD
        });
        console.log(`SHOPIFY_SHOPNAME: ${environment.SHOPIFY_SHOPNAME}`);
        console.log(`SHOPIFY_APIKEY: ${environment.SHOPIFY_APIKEY}`);
        console.log(`SHOPIFY_PASSWORD: ${environment.SHOPIFY_PASSWORD}`);
    },
    locationId: null,
    getLocationId: async function () {
        if (!this.locationId) {
            const stockLocations = await shopify.location.list();
            if (stockLocations.length !== 1)
                console.error('The implementation only cater for 1 location at the moment');
            else {
                this.locationId = stockLocations[0].id;
            }
        }
        return this.locationId;
    },
    createProduct: async function (stock_store) {
        try {
            await shopify.product.create({
                "title": stock_store.descr,
                "body_html": stock_store.descr,
                "vendor": "Mopani",
                "product_type": "",
                "published": false,
                "variants": [
                    {
                        "option1": "Default Title",
                        "price": stock_store.price,
                        "sku": stock_store.sku
                    }
                ]
            });
        }
        catch (err) {
            console.log(err);
        }
    }
}