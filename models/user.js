var Joi = require('@hapi/joi');
var mongoose = require('mongoose');
const joigoose = require('joigoose')(mongoose)

var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    firstname: {type: String, required: true, max: 100},
    lastname: {type: String, required: true, max: 100},
    password: {type: String, required: true},
    email: {type: String, required: true},
    date: { type: Date, default: Date.now },
    channel: [{type: mongoose.Schema.Types.ObjectId, ref: 'channel'}],
  }
);

var validateUser = (user)=>{
    const schema = Joi.object({
        firstname: Joi.string().min(2).max(50).required(),
        lastname: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    });
    return schema.validate(user);
}


//Export model
exports.User =  mongoose.model('user', UserSchema);
exports.validate = validateUser;