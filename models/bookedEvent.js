const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    eventName:{
        type:String,
        required: true,
    },
    bookedBy:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
});

module.exports = mongoose.model('bookedevent', eventSchema);