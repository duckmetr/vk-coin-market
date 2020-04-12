const VKCOINAPI = require('node-vkcoinapi');
const config = require('../config');

let { key, userId, token } = config.vkcoin

const vkcoin = new VKCOINAPI({key, userId, token});

module.exports = vkcoin;