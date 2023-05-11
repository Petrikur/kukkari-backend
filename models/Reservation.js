const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const reservationSchema = new Schema({
    startDate: {type : Date, required:true},
    endDate: {type: Date,required:true},
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    creatorName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
