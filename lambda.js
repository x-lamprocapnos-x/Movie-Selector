const serverlessExpress = require('@vendia/serverless-express');
const app = require('./index.js'); //Express App
exports.handler = serverlessExpress({ app })
