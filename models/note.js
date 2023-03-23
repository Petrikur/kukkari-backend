const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    name: {type:String,required:true},
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'},
   
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);