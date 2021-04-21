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
var CharitySchema = new Schema({
    charityName: { type: String, required: true},
    charityId: { type: String, required: true},
    charityDesc: { type: String, required: true},
    totalDonation: { type: Number, required: true}
});


//return the model to server
module.exports = mongoose.model('Charity', CharitySchema);