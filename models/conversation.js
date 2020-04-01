var Joi = require('@hapi/joi');
var mongoose = require('mongoose');
const joigoose = require('joigoose')(mongoose)
const message = require('./message.js');

var ThreadSchema = mongoose.Schema(
  {
    title: {type: String, required: true, max: 100},
    date: { type: Date, default: Date.now },
    message: [{type: mongoose.Schema.Types.ObjectId, ref: 'message'}],
  }
);

//Export model
exports.Thread =  mongoose.model('Thread', ThreadSchema);