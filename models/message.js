var Joi = require('@hapi/joi');
var mongoose = require('mongoose');
const joigoose = require('joigoose')(mongoose)
var Schema = mongoose.Schema;

var MessageSchema = new Schema(
  {
    msg: {type: String, required: true},
    date: { type: Date, default: Date.now },
    channel_id: { type: String},
    user: {type: String, required: true},
  }
);

var validateMessage = (msgObj)=>{
    const schema = Joi.object({
        msg: Joi.string().min(1).required(),
        channel_id: Joi.string().min(1).max(100).required(),
    });
    return schema.validate(msgObj);
}


//Export model
exports.Message =  mongoose.model('message', MessageSchema);
exports.vmsg = validateMessage;