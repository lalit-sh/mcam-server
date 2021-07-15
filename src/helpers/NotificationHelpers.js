import FCMMiddleware from "../middleware/FCM.middleware"
import Groups from "../models/groups";
import Users from "../models/users";

const fcm = new FCMMiddleware();

export const userAddedNotification = async ({members, groupId, sender, groupName, updatedMember}) => {
    try{
        let eventName = "ADDED_USER_TO_GROUP"; 
        let tokens = await getTokensOfMembers({members, groupId, sender});
        if(tokens && tokens.length > 0){
            sendMessage({ sender, receivers: tokens, eventName: eventName, params: {groupName, updatedUserName: updatedMember, groupId: groupId}})
        }
    }catch(err){
        console.log("Error in NotificationHelpers at userAddedNotification: ", err);
        return false;
    }
}

export const userRemovedNotification = async ({members, groupId, sender, groupName, updatedMember}) => {
    try{
        let eventName = "REMOVED_USER_TO_GROUP"; 
        let tokens = await getTokensOfMembers({members, groupId, sender});
        if(tokens && tokens.length > 0){
            sendMessage({ sender, receivers: tokens, eventName: eventName, params: {groupName, updatedUserName: updatedMember, groupId: groupId}})
        }
    }catch(err){
        console.log("Error in NotificationHelpers at userRemovedNotification: ", err);
        return false;
    }
}

export const userLeftNotifiction = async ({members, groupId, sender, groupName}) => {
    try{
        let eventName = "USER_LEFT_GROUP"; 
        let tokens = await getTokensOfMembers({members, groupId, sender});
        if(tokens && tokens.length > 0){
            sendMessage({ sender, receivers: tokens, eventName: eventName, params: {groupName, groupId}})
        }
    }catch(err){
        console.log("Error in NotificationHelpers at userLeftNotifiction: ", err);
        return false;
    }
}

export const groupDeletedNotification = async ({members, groupId, sender, groupName}) => {
    try{
        let eventName = "GROUP_DELETED"; 
        let tokens = await getTokensOfMembers({members, groupId, sender});
        if(tokens && tokens.length > 0){
            sendMessage({ sender, receivers: tokens, eventName: eventName, params: {groupName, groupId}})
        }
    }catch(err){
        console.log("Error in NotificationHelpers at userLeftNotifiction: ", err);
        return false;
    }
}

export const newImageAddedNotification = async () => {

}

const getFCMTokenOfUsers = async (users) => {
    try{
        users = users.map(el => el.username || el);
        users = await Users.find({username: {$in: users}}).select("fcmToken");
        return users.map(el => el.fcmToken);
    }catch(err){
        console.log("err", err);
        return null;
    }
};

const getTokensOfMembers = async ({members, groupId, sender}) => {
    try{
        if(!members && groupId)
            members = await getMembersFromGroup(groupId);
        if(!members)
            return false;
        members = members.filter(el => ((el.username || el) !== sender))
        let tokens = await getFCMTokenOfUsers(members);
        return tokens;
    }catch(err){
        console.log("Error in NotificationHelpers.js at getTokensOfMembers: ", err);
        return [];
    }
}

const getMembersFromGroup = async (id) => {
    try{
        let group = Groups.findOne({_id: id}).exec();
        if(group)
            return group.members;
        return null;
    }catch(err){
        return null;
    }
} 

const sendMessage = ({sender, eventName, params, receivers}) => {
    let message = fcm.makeMessage({
        data: {
            sender: sender,
            type: eventName,
            ...params
        }
    });
    fcm.sendMessage(message, [...receivers]);
}