var Joi = require('@hapi/joi');
var mongoose = require('mongoose');
const joigoose = require('joigoose')(mongoose)
const user = require('./user.js');
var Schema = mongoose.Schema;

var ChannelSchema = new Schema(
  {
    title: {type: String, required: true, max: 100},
    date: { type: Date, default: Date.now },
    user: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    message: [{type: mongoose.Schema.Types.ObjectId, ref: 'message'}],
  }
);

var validateChannel = (channel)=>{
    const schema = Joi.object({
        title: Joi.string().min(1).max(100).required()
    });
    return schema.validate(channel);
}


//Export model
exports.Channel =  mongoose.model('channel', ChannelSchema);
exports.validate = validateChannel;