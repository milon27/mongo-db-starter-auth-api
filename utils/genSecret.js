const crypto = require('crypto')

const key = crypto.randomBytes(25)
console.log(key.toString('hex'));
