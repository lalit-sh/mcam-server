import User from "../models/users";
import { genToken } from "../helpers/commonHelper";
import BaseController from "./baseController";
import { sendSms } from "../helpers/SMSHelper";

class AuthController extends BaseController {

    login = async (req, res) => {
        try {
            req.checkBody("username", "Phone number is required").notEmpty();
            req.checkBody("username", "Phone number must be 10 digit numeric value").isNumeric();
            req.checkBody("username", "Phone number must be of 10 digits").isLength({ min: 10, max: 10 });
            // req.checkBody("password", "Invalid password").notEmpty();
            let errors = req.validationErrors();
            if (errors) 
                return res.status(400).json({ 
                "message": "Invalid credentials", 
                "errors": errors 
            });
            //Generating a random 4 digit number to act as otp
            let password = Math.floor(1000 + Math.random() * 9000);
            let user = await User.findOne({ "username": req.body.username }).exec();
            if (user === null){
                user = new User({
                    username: req.body.username, 
                    password: password,
                    deviceId: req.body.deviceId
                });
                user = await user.save();
            }else{
                user.password = password;
                user.save();
            }
            console.log("OTP is", password);
            // sendSms({to: req.body.username, message: `Your MCAM login OTP ${password}.`})
            return res.status(200).end();
        } catch (err) {
            console.log(err);
            return res.status(500).json({ "message": "An error occured", "errors": err });
        }
    }

    verifyOTPAndGenerateToken = async (req, res) => {
        try{
            req.checkBody("username", "Phone number is required").notEmpty();
            req.checkBody("username", "Phone number must be 10 digit numeric value").isNumeric();
            req.checkBody("username", "Phone number must be of 10 digits").isLength({ min: 10, max: 10 });
            req.checkBody("password", "Invalid OTP").notEmpty();
            let errors = req.validationErrors();
            if (errors) 
                return res.status(400).json({ 
                "message": "Invalid credentials", 
                "errors": errors 
            });

            let user = await User.findOne({ "username": req.body.username }).exec();
            if (user === null){
                return res.status(400).json({"message": "Invalid request, no user exist with the following id"});
            }
            let success = await user.comparePassword(req.body.password);
            if(success){
                await user.updateOne({isLoggedIn: true, password: ""});
                return res.status(200).json(genToken(user));    
            }
            return res.status(400).json({"message": "OTP did not match. Please try again"});
        }catch(err){
            console.log(err);
            return res.status(500).json({ "message": "An error occured", "errors": err });
        }
    }

    getUserDetails = async (req, res) => {
        try{
            let username = req.user.username;
            let user = await User.findOne({username: username}, "-password")
            .lean().exec();
            return res.status(200).json(user);
        }catch(err){
            console.log('err', err)
            res.status(500).json({ "message": "An error occured", "errors": err });
        }
    }

    updateUser = async (req, res) => {
        return res.status(201).json({"message": "Method not setup"});
    }

    syncUserContacts = async (req, res) => {
        try{
            if(!req.user) 
                return this.response(res, {"message": "Invalid user"});
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