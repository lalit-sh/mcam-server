import BaseController from "./BaseController";
import Images, { newImage } from "../models/images";
import Users from "../models/users";
import Trips from "../models/groups";
import FCMMiddleware from "../middleware/FCM.middleware";
import  { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


let fcm = new FCMMiddleware();
class ImageShareController extends  BaseController {

    uploadImageS3 = async (req, res, next) => {
        try{
            let { groupId, imageKey } = req.body;
            let t = await Trips.findOne({_id: groupId});
            if(!t){
                return this.response(res, {"success": false, message: "Invalid trip provdided"});
            }
            const fileContent  = Buffer.from(req.files.file.data, 'binary')
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: `${process.env.S3_OBJECT_PATH}/${imageKey}`, // File name you want to save as in S3
                Body: fileContent 
            };
            await s3Client.send(new PutObjectCommand(params))            
            next();
        }catch(err){
            console.log("Error in ImageShareController uploadImageS3 action ", err);
            return this.response(res, {"message": err});   
        }
    }

    processNewImageClicked = async (req, res) => {
        try{
            let data = req.body;
            let username = req.user.username;
            if(!data.groupId || !username || !data.imageKey ){
                return this.response(res, {"message": "Invalid data provided"});
            }
            let { members, groupId, imageKey } = data;
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
                members: m,
                type: "NEW_IMAGE_RECEIVED"
            });
            
            let bucket = process.env.S3_BUCKET
            const getObjectParams = {
                Bucket: bucket,
                Key: `${process.env.S3_OBJECT_PATH}/${imageKey}`
            };
            let command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            
            var message = fcm.makeMessage({
                                            priority: 'high',
                                            data: {
                                                imageUri: url,
                                                imageKey: imageKey,
                                                group: t.name,
                                                sender: username,
                                                id: result._id,
                                                type: "NEW_IMAGE_RECEIVED"
                                            }
                                        });
            fcm.sendMessage(message, fcms);
            return this.response(res, {"success": true})
        }catch(err){
            console.log("Error in ImageShareController processNewImageClicked action ", err);
            return this.response(res, {"message": err});
        }        
    }

    // getPresignedUrlPUT = async (req, res) => {
    //     try{
    //         let { key } = req.query
    //         let bucket = process.env.S3_BUCKET
    //         const getObjectParams = {
    //             Bucket: bucket,
    //             Key: `${process.env.S3_OBJECT_PATH}/${key}`
    //         }
    //         let command = new PutObjectCommand(getObjectParams);
    //         const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    //         return this.response(res, url);
    //     }catch(err){
    //         console.log("Error in ImageShareController getPresignedUrl action ", err);
    //         return this.response(res, {"message": err});
    //     }
    // } 

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