const mongoose = require('mongoose')
class Model {
    constructor() {
        mongoose.connect(`${process.env.MONGO_DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function () {
            console.log('we\'re connected!');
        });
    }

}
module.exports = Model