import BaseController from "./baseController";
import Images, { newImage } from "../models/images";
import Users from "../models/users";
import Trips from "../models/trips";
import FCMMiddleware from "../middleware/FCM.middleware";
// import { FCM_API_KEY } from "../config/config";
// import gcm from "node-gcm";

let fcm = new FCMMiddleware();

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
            
            let mm = []
            members = members.map((el) => el.username !== username && mm.push(el.username));//skipping self

            let m = await Users.find({username: {$in: mm}, fcmToken: {$exists: true}});
            let fcms = [];
            m = m.map(el => {
                fcms.push(el.fcmToken);
                return {username: el.username, isImageDelivered: false}
            });
            let result = await newImage({
                sender: username,
                tripname: t.name,
                imageKey: imageKey,
                imageUrl: imageUrl,
                members: m,
                type: "NEW_IMAGE_RECEIVED"
            });
            
            var message = fcm.makeMessage({
                                            priority: 'high',
                                            data: {
                                                imageUri: imageUrl,
                                                imageKey: imageKey,
                                                group: t.name,
                                                sender: username,
                                                id: result._id
                                            }
                                        });
            fcm.sendMessage(message, fcms);
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