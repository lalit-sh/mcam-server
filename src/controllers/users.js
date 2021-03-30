import User from "../models/users";
import { genToken } from "../helpers/commonHelper";
import BaseController from "./baseController";
import app from "../../app";

class AuthController extends BaseController {

    login = async (req, res) => {
        try {
            req.checkBody("username", "Invalid username").notEmpty();
            req.checkBody("password", "Invalid password").notEmpty();
            let errors = req.validationErrors();
            if (errors) return res.status(200).json({ "message": "Invalid credentials", "errors": errors });

            let user = await User.findOne({ "username": req.body.username }).exec();

            if (user === null) return res.status(200).json({ "message": "Either username or password is incorrect." });

            let success = await user.comparePassword(req.body.password);
            if (success === false) return res.status(200).json({ "message": "Either username or password is incorrect." });;
            user.updateOne({isLoggedIn: true});
            return res.status(200).json(genToken(user));
        } catch (err) {
            console.log(err);
            return res.status(500).json({ "message": "An error occured", "errors": err });
        }
    }

    signup = async (req, res) => {
        try{
            req.checkBody("username", "Invalid username").notEmpty();
            req.checkBody("password", "Invalid password").notEmpty();
            req.checkBody("deviceId", "Invalid data. Please try again.").notEmpty();
            let errors = req.validationErrors();
            if (errors) return res.status(200).json({ "message": "Invalid credentials", "errors": errors });
            let user = await User.findOne({ "username": req.body.username }).exec();

            if (user) return res.status(200).json({ "message": "User already exist" });

            let newUser = new User({name: req.body.name, username: req.body.username, password: req.body.password, deviceId: req.body.deviceId});
            newUser.save(function(err, user){
                if(err) {
                    return res.status(200).json({ "message": "Something went wrong.", error: err });
                }
                // let user = await User.findOne({ "username": req.body.username }).exec();
                user.updateOne({isLoggedIn: true});
                return res.status(200).json(genToken(user));    
            });        
            
            
        }catch(err) {
            console.log(err)
            res.status(500).json({ "message": "An error occured", "errors": err });
        }
    }

    getUserDetails = async (req, res) => {
        try{
            let id = req.query.id;
            let username = req.query.username;
            if(!id && !username){
                return res.status(200).json({ "message": "Invalid credentials", "errors": "Invalid userid provided" });
            }

            User.findOne({$or: [
                {username: username}, {_id: id}
            ]}, "-password").lean().exec(function(err, user) {
                if(err)
                    return res.status(200).json({ "message": "User not found" });
                
                return res.status(200).json(user);
                
            });

        }catch(err){
            console.log('err', err)
            res.status(500).json({ "message": "An error occured", "errors": err });
        }
    }

    updateUser = async (req, res) => {
        return res.status(201).json({"message": "Method not setup"});
    }

    async getUserContacts(req, res) {
        try{
            let query = req.query;
            let username = app.get("user");
            if(username)
                username = username["username"];
            else
                return this.response(res, {"message": "Invalid user provided"});
            
            const result = await User.find({}, {username: 1, deviceId: 1});
            return this.response(res, result);
        }catch(err){
            return this.response(res, {"message": err.message});
        }
    }

    syncUserContacts = async (req, res) => {
        try{
            if(!req.user) return this.response(res, {"message": "Invalid user"});
            let contacts = req.body && req.body.contacts;
            if(!contacts || !Array.isArray(contacts) || contacts.length == 0){
                return this.response(res, {"message": "No data to check"});
            }
            let c = contacts.map(el => {
                return el.number || el
            });
            const result = await User.find({$and: [{"username": {$in: c}}, {"username": {$ne: req.user.username}}]}, {username:1});
            return this.response(res, result);
        }catch(err){
            console.log(err);
            return this.response(res, {"message": err.message});
        }
    }

    updateFCMToken = async (req, res) => {
        try{
            if(!req.user) return this.response(res, {"message": "Invalid user"});
            let fcmToken = req.body && req.body.token;
            if((!fcmToken || !fcmToken.trim())) return this.response(res, {"message": "Invalid call."});
            let username = req.user.username;
            const result = await User.updateOne({username: username}, {fcmToken: fcmToken});
            return this.response(res, result);
        }catch(err){
            console.log(err);
            return this.response(res, {message: err.messate})
        }
    }

    logout = async (req, res) => {
        try{
            if(!req.user) return this.inValidUserResponse(res);
            let username = req.user.username;
            const result = await User.updateOne({username: username}, {fcmToken: "", isLoggedIn: true});
            return this.response(res, result);
        }catch(err){
            console.log(err);
            return this.response(res, {message: err.message});
        }
    }
}

export default AuthController;