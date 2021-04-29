//CSCI 3916 Project
//Dillon Shaver, Loureen Viloria
//File: server.js
//Description: web api server code for project
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var mongoose = require('mongoose');
var User = require('./Users');
var Charity = require('./Charity');
var Item = require('./Items');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

//Sign up
router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        return res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code === 11000){
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                }
                else{
                    return res.json({success: false, msg: 'Unexpected error occured while trying to save user.'});
                }
            }
            return res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

//Sign in
router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    console.log(userNew.username);
    userNew.password = req.body.password;
    console.loog(userNew.username);

    User.findOne({ username: userNew.username }).select('username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token, userName: userToken});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

//Charity route
router.route('/charity')
    .get(authJwtController.isAuthenticated, function(req,res){
        Charity.find({}, function(err, charityList){
            if(err){
                return res.status(400).send({success: false, msg: "An unexpected error occurred while trying to get all charities.", error: err});
            }
            else{
                return res.status(200).send({success: true, Items: charityList, msg: "charity list sent."});
            }
        })
    })


//Item route
router.route('/items')
    .get(authJwtController.isAuthenticated, function(req,res){
        //front end send item id in the Item parameter
        //only wants one item
        if(req.param.Item){
            var itemFind = new Item();
            //pass item id from parameter so we can search for the item
            itemFind.itemId = req.param.Item;

            Item.findOne({itemId: itemFind.itemId}, function(err, item){
                if(err){
                    return res.status(401).send({success: false, msg: "An unexpected error occured while trying to find item.", error: err});
                }
                else{
                    return res.status(200).send({success: true, Item: item});
                }
            })
        }
        //if asking for all items
        else{
            Item.find({}, function(err, itemList){
                if(err){
                    return res.status(400).send({success: false, msg: "An unexpected error occured while trying to get all items.", error: err});
                }
                else{
                    return res.status(200).send({success: true, Items: itemList, msg: "Item list sent."});
                }
            })
        }
    })
    .post(authJwtController.isAuthenticated, function(req,res){
        if(!req.body.itemId || !req.body.itemName || !req.body.itemDesc || !req.body.itemPrice){
            return res.status(400).send({success: false, msg:'Please include item id, item name, itemDesc, and price'})
        }
        var itemSave = new Item();
        itemSave.itemId = req.body.itemId;
        itemSave.itemName = req.body.itemName;
        itemSave.itemDesc = req.body.itemDesc;
        itemSave.itemPrice = req.body.itemPrice;
        if(req.body.imageUrl) {
            itemSave.imageUrl = req.body.imageUrl;
        }
        else{
            itemSave.imageUrl = " ";
        }

        itemSave.save(function(err){
            if(err){
                res.status(401).send({success: false, msg: "An unexpected error occured while trying to create item.", error: err});
            }
            else{
                res.status(200).send({success: true, msg:"Item successfully created."});
            }
        })
    })
    .put(authJwtController.isAuthenticated, function(req,res){
        if(!req.body.itemId || !req.body.itemName || !req.body.itemDesc || !req.body.itemPrice){
            return res.status(400).send({success: false, msg:'Please include item id, item name, itemDesc, and price'})
        }
        var itemUp = new Item();
        itemUp.itemId = req.body.itemId;
        itemUp.itemName = req.body.itemName;
        itemUp.itemDesc = req.body.itemDesc;
        itemUp.itemPrice = req.body.itemPrice;
        if(req.body.imageUrl) {
            itemUp.imageUrl = req.body.imageUrl;
        }
        else{
            itemUp.imageUrl = " ";
        }

        Item.findOne({itemId: itemFind.itemId}, function(err, item){
            if(err){
                return res.status(401).send({success: false, msg: "An unexpected error occurred while trying to find item to update.", error: err});
            }
            else{
                item.itemId = itemUp.itemId;
                item.itemName = itemUp.itemName;
                item.itemDesc = itemUp.itemDesc;
                item.itemPrice = itemUp.itemPrice;
                item.imageUrl = itemUp.imageUrl;
                item.save(function(err){
                    if (err){
                        res.status(401).send({success: false, msg: "an unexpected error occurred while trying to update item"});
                    }
                    else{
                        res.status(200).send({success: true, msg: "Item successfully updated."});
                    }
                })
            }
        })
    })
    .delete(authJwtController.isAuthenticated, function(req,res){
        if(!req.header('itemId')){
            res.status(401).send({success: false, msg: "Please include item Id."});
        }
        var itemDel = new Item();
        itemDel.itemId = req.header('itemId');

        Item.findOneAndRemove({itemId: itemDel.itemId}, function(err, item){
            if (err) {
                res.status(401).send({success: false, msg: "an unexpected error occurred while trying to delete Item"});
            } else {
                res.status(200).send({success: true, msg: "Item successfully deleted."});
            }
        })
    })


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only
