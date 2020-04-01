const config = require('config');
var express = require('express');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var router = express.Router();
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
    let data = await Message.findById(req.body.msg_id)
    let thread = new Thread({
        _id: new mongoose.Types.ObjectId(), 
        title: data.msg
    })
    if(thread.save()){
        return res.send(thread)
    }else{
        return res.send('something went wrong')
    }
    
    
});

//get all channel
router.post('/all', async (req, res) => {
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
    Thread.find().populate('message').exec((err, ch)=>{
        if (err) return handleError(err);
        return res.send(ch)
    })
})

//show a channel
router.get('/:id', async (req, res) => {
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
    Thread.findById(req.params.id).populate('message').exec((err, ch)=>{
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
    Thread.findByIdAndRemove(req.params.id)
    .then(thread => {
      if(!thread) {
        return res.status(404).send({
          message: "thread not found with id " + req.params.id
        })
      }
      res.send({message: "thread deleted successfully!"});
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