const config = require('config');
var express = require('express');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var router = express.Router();
const { Channel, validate } = require('../models/channel');
const { User, v } = require('../models/user');

router.post('/new', async(req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
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
    let channel = new Channel({
        _id: new mongoose.Types.ObjectId(), 
        title: req.body.title,
        user: payload._id
    });
    await channel.save();
    User.findById(payload._id)
    .then(user => {
        if(!user) {
          return res.status(404).send({
            message: "User not found with id " + payload._id
          })
        }
        user.channel.push(channel._id)
        if(user.save()){
            res.send(user);
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
    //user._id
    //await user.save()
    
});

//get all channel
router.post('/all', async (req, res) => {
    Channel.find().populate('user').populate('message').exec((err, ch)=>{
        if (err) return handleError(err);
        return res.send(ch)
    })
})

//show a channel
router.get('/:id', async (req, res) => {
    Channel.findById(req.params.id).populate('user').exec((err, ch)=>{
        if (err) return handleError(err);
        return res.send(ch)
    })

})

//delete channel
router.delete('/:id', async (req, res) => {
    Channel.findByIdAndRemove(req.params.id)
    .then(channel => {
      if(!channel) {
        return res.status(404).send({
          message: "channel not found with id " + req.params.id
        })
      }
      res.send({message: "channel deleted successfully!"});
    }).catch(err => {
      if(err.kind === 'ObjectId') {
        return res.status(404).send({
            message: "channel not found with id " + req.params.id
        });                
      }
      return res.status(500).send({
        message: "Error retrieving channel with id " + req.params.id
      });
    })
  })

//update channel
router.put('/:id', async (req, res) => {
    Channel.findByIdAndUpdate(req.params.id, {title: req.body.title},{new: true})
    .then(channel => {
      if(!channel) {
        return res.status(404).send({
          message: "channel not found with id " + req.params.id
        })
      }
      res.send(channel);
    }).catch(err => {
      if(err.kind === 'ObjectId') {
        return res.status(404).send({
            message: "channel not found with id " + req.params.id
        });                
      }
      return res.status(500).send({
        message: "Error retrieving user with id " + req.params.id
      });
    })
  })

module.exports = router;