import BaseController from "./baseController";
import Images, { newImage } from "../models/images";
import Users from "../models/users";
import Trips from "../models/trips";
import { FCM_API_KEY } from "../config/config";
import gcm from "node-gcm";

let fcm = new gcm.Sender(FCM_API_KEY);

class ImageShareController extends  BaseController {

    processNewImageClicked = async (req, res) => {
        try{
            let data = req.body;
            let username = req.user.username;
            if(!data.imageUrl || !data.groupId || !username || !data.imageKey ){
                return this.response(res, {"message": "Invalid data provided"});
            }
            let { imageUrl, members, groupId, imageKey } = data;
            let t = await Trips.findOne({_id: groupId});
            if(!t){
                return this.response(res, {"success": false, message: "Invalid trip provdided"});
            }

            if(t && !members || members.length < 1){
                members = t.members;
            }

            let m = await Users.find({username: {$in: members}, fcmToken: {$exists: true}});
            let fcms = [];
            m = m.map(el => {
                fcms.push(el.fcmToken);
                return {username: el.username, isImageDelivered: false}
            })
            let result = await newImage({
                sender: username,
                tripname: t.name,
                imageKey: imageKey,
                imageUrl: imageUrl,
                members: m
            });
            
            var message = new gcm.Message({
                priority: 'high',
                // notification: {
                //     title: `New Image Shared`,
                //     body: `${username} share image in ${t.name} group`,
                // },
                data: {
                    imageUri: imageUrl,
                    imageKey: imageKey,
                    group: t.name,
                    username: username,
                    id: result._id
                },
            });

            fcm.send(message, {registrationTokens: fcms}, function (err, response) {
                console.log("err", err)
                console.log("response", response)
                if (err) {
                    if (JSON.parse(err).results)
                        console.log(JSON.parse(err).results[0].error)
                } else {

                }
            })
            return this.response(res, {"success": true})
        }catch(err){
            console.log("Error in ImageShareController processNewImageClicked action ", err);
            return this.response(res, {"message": err});
        }        
    }

    // sendNotifiction = () => {

    // }
    
    // imageDownloadSuccess = async (req, res) => {
    //     try{
    //         let { shareId } = req.body;
    //         let username = req.user.username;
    //         if(!data.shareId) return this.response(res, {"message": "Invalid data provided"});

    //         // let image = await Images.
    //         // let image = await Images.findOne({_id: shareId});
            

    //     }catch(err){
    //         console.log("Error in ImageShareController at imageDownloadSuccesss action ", err);
    //         return this.response(res, {"message": err});
    //     }
    // } 
}

export default ImageShareController;