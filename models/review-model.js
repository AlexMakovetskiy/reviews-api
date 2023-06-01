const {Schema, model} = require('mongoose');

const ReviewSchema = new Schema({
    id: {type: Number, unique: true, required: true},
    image: {type: String, unique: true},
    text: {type: String, required: true},
    date: {type: String, required: true},
    lesson_num: {type: String, required: true},
    title: {type: String, unique: true, required: true},
    author: {type: Number, required: true},

});

module.exports = model('Review', ReviewSchema); 