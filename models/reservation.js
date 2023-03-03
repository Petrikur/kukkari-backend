const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const reservationSchema = new Schema({
    startDate: {type : Date, required:true},
    // end: {type: Date,required:true},
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    title: {type :String,required:true}
});

module.exports = mongoose.model('Reservation', reservationSchema);