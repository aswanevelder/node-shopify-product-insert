const product = require('./logic/product');

exports.handler = async function (event, context, callback) {
    await product.init();
    await product.createMissingProducts();
};

exports.handler();