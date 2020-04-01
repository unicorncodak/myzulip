const config = require('config');
var express = require('express');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var router = express.Router();
const {Channel, validate} = require('../models/channel');
const {Thread} = require('../models/conversation');
const { Message, vmsg } = require('../models/message');

router.post('/new', async(req, res) => {
    
    const token = req.cookies.token
    if (!token) {
        return res.status(401).send('No token passed')
    }
    var payload;
    try {
        // Parse the JWT string and store the result in `payload`.
        // Note that we are passing the key in this method as well. This method will throw an error
        // if the token is invalid (if it has expired according to the expiry time we set on sign in),
        // or if the signature does not match
        payload = jwt.verify(token, config.get('PrivateKey'))
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
          // if the error thrown is because the JWT is unauthorized, return a 401 error
          return res.status(401).end()
        }
        // otherwise, return a bad request error
        return res.status(400).end()
    }


    // Insert the new channel if they do not exist yet
    let message = new Message({
        _id: new mongoose.Types.ObjectId(), 
        msg: req.body.msg,
        user: payload._id,
        channel_id: req.body.channel_id,
    });
    await message.save();
    if(req.body.conversation_id){
      Thread.findById(req.body.conversation_id)
      .then(conv => {
          if(!conv) {
            return res.status(404).send({
              message: "Something went wrong"
            })
          }
          conv.message.push(message._id)
          if(conv.save()){
              res.send(conv);
          }
          
        }).catch(err => {
          if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + payload._id
            });                
          }
          return res.status(500).send({
            message: "Error retrieving user with id " + payload._id
          });
        })
    } else {
      Channel.findById(req.body.channel_id)
      .then(channel => {
          if(!channel) {
            return res.status(404).send({
              message: "User not found with id " + payload._id
            })
          }
          channel.message.push(message._id)
          if(channel.save()){
              res.send(channel);
          }
          
        }).catch(err => {
          if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + payload._id
            });                
          }
          return res.status(500).send({
            message: "Error retrieving user with id " + payload._id
          });
        })
    }
    
});

//get all channel
router.get('/all', async (req, res) => {
    Channel.find().populate('user').exec((err, ch)=>{
        if (err) return handleError(err);
        return res.send(ch)
    })
})

//delete channel
router.delete('/:id', async (req, res) => {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).send('No token passed')
    }
    var payload;
    try {
        // Parse the JWT string and store the result in `payload`.
        // Note that we are passing the key in this method as well. This method will throw an error
        // if the token is invalid (if it has expired according to the expiry time we set on sign in),
        // or if the signature does not match
        payload = jwt.verify(token, config.get('PrivateKey'))
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
          // if the error thrown is because the JWT is unauthorized, return a 401 error
          return res.status(401).end()
        }
        // otherwise, return a bad request error
        return res.status(400).end()
    }
    Message.findByIdAndRemove(req.params.id)
    .then(message => {
      if(!message) {
        return res.status(404).send({
          message: "message not found with id " + req.params.id
        })
      }
      res.send({message: "message deleted successfully!"});
    }).catch(err => {
      if(err.kind === 'ObjectId') {
        return res.status(404).send({
            message: "message not found with id " + req.params.id
        });                
      }
      return res.status(500).send({
        message: "Error retrieving message with id " + req.params.id
      });
    })
  })

//update channel
router.put('/:id', async (req, res) => {
    Message.findByIdAndUpdate(req.params.id, {msg: req.body.msg},{new: true})
    .then(message => {
      if(!message) {
        return res.status(404).send({
          message: "channel not found with id " + req.params.id
        })
      }
      res.send(message);
    }).catch(err => {
      if(err.kind === 'ObjectId') {
        return res.status(404).send({
            message: "message not found with id " + req.params.id
        });                
      }
      return res.status(500).send({
        message: "Error retrieving user with id " + req.params.id
      });
    })
  })

module.exports = router;