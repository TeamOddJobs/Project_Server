var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

//mongoose.connect(process.env.DB, { useNewUrlParser: true });
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log("could not connect");
}
mongoose.set('useCreateIndex', true);

//movie schema
var ItemsSchema = new Schema({
    itemId: { type: String, required: true},
    itemName: { type: String, required: true},
    itemDesc: { type: String, required: true},
    itemPrice: { type: Number, required: true},
    imageUrl: {type: String}
});


//return the model to server
module.exports = mongoose.model('Items', ItemsSchema);