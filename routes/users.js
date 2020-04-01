const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validate } = require('../models/user');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/', async (req, res) => {
    // First Validate The Request
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    // Check if this user already exisits
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).send('That user already exisits!');
    } else {
        // Insert the new user if they do not exist yet
        user = new User(_.pick(req.body, ['firstname', 'lastname', 'email', 'password']));

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();
        const token = jwt.sign({ _id: user._id }, config.get('PrivateKey'));
        res.header('x-auth-token', token).send(_.pick(user, ['_id', 'firstname', 'email']));
    }
});

//show user
router.get('/user/:id', async (req, res) => {
  User.findById(req.params.id)
  .then(user => {
    if(!user) {
      return res.status(404).send({
        message: "User not found with id " + req.params.id
      })
    }
    res.send(user);
  }).catch(err => {
    if(err.kind === 'ObjectId') {
      return res.status(404).send({
          message: "User not found with id " + req.params.id
      });                
    }
    return res.status(500).send({
      message: "Error retrieving user with id " + req.params.id
    });
  })
})

//get all users
router.get('/getall', async (req, res) => {
  let user = await User.find().then(users => {
    res.send(users);
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving users."
    });
  })
})

//delete user
router.delete('/user/:id', async (req, res) => {
  User.findByIdAndRemove(req.params.id)
  .then(user => {
    if(!user) {
      return res.status(404).send({
        message: "User not found with id " + req.params.id
      })
    }
    res.send({message: "User deleted successfully!"});
  }).catch(err => {
    if(err.kind === 'ObjectId') {
      return res.status(404).send({
          message: "User not found with id " + req.params.id
      });                
    }
    return res.status(500).send({
      message: "Error retrieving user with id " + req.params.id
    });
  })
})

//update user
router.put('/user/:id', async (req, res) => {
  User.findByIdAndUpdate(req.params.id, {firstname: req.body.firstname},{new: true})
  .then(user => {
    if(!user) {
      return res.status(404).send({
        message: "User not found with id " + req.params.id
      })
    }
    res.send(user);
  }).catch(err => {
    if(err.kind === 'ObjectId') {
      return res.status(404).send({
          message: "User not found with id " + req.params.id
      });                
    }
    return res.status(500).send({
      message: "Error retrieving user with id " + req.params.id
    });
  })
})


module.exports = router;