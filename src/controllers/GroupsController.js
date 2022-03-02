import Trips from "../models/groups";
import BaseController from "./BaseController";
import Users from "../models/users";
import { groupDeletedNotification, userAddedNotification, userLeftNotifiction, userRemovedNotification } from "../helpers/NotificationHelpers"

class TripsController extends BaseController{

    async createNewTrip(req, res){
        try{
            let { name, members } = req.body;
            let username = this.getUserName();
            let admin = {
                username: username,
                isAdmin: true
            }
            if(members && Array.isArray(members) && members.length > 0 && !members.findIndex(el => el.username !== username))
                members = [admin, ...members]
            else
                members = [admin]

            let d = {
                name: name,
                username: username,
                members: members,
                status: 'Active',
                isActive: true,
            };

            await Trips.updateMany({username: username}, {$set: {"isActive": false}});
            const trip = new Trips(d);
            const result = await trip.save();

            return this.response(res, result);

        }catch(error){
            return this.response(res, {"message": error.message});
        }
    }

    async getTrips(req, res){
        let { limit, skip } = req.query;
        let username = this.getUserName();

        try{
            const trip = await Trips.find({ "username": username }).limit(limit).skip(skip).sort({created_at: 1});
            return this.response(res, trip);
        }catch(error){
            return this.response(res, {"message": "Unable to fetch results", error: error})
        }
    }

    async getUserTrips(req, res){
        try{
            let user = req.user.username;
            const trips = await Trips.find({ "members.username": user, isActive: true })
            return this.response(res, trips);
        }catch(error){
            return this.response(res, {"message": "Unable to fetch results", error: error})
        }
    }

    async updateTrips(req, res){
        try{
            let { tripName, data } = req.body;
            let { name, members } = data;
            let username = this.getUserName();

            if(!tripName){
                return this.response(res, {"message": "Missing parameter tripname"});
            }
            if(!data){
                return this.response(res, {"message": "Missing parameter data"});
            }
            if(!username){
                return this.response(res, {"message": "Missing parameter username"});
            }

            members = members.map(el => {
                if(typeof el == 'string'){
                    el = {
                        username: el
                    }
                }
                return el;
            })

            let d = {
                members: members
            };

            if(name && name !== tripName){
                d.name = name;
            }

            let trip = await Trips.findOneAndUpdate({username: username, name: tripName}, {$set: d}, {new: true});
            return this.response(res, trip);
        }catch(error){
            return this.response(res, {"message": "Unable to update trip", error: error});
        }
    }

    async deleteTrip(req, res){
        try{
            let id  = req.body.group_id;
            let username = this.getUserName();
            let result = await Trips.findOneAndDelete({_id: id,members: {$elemMatch: { username: username, isAdmin: true }}});
            if(result){
                await groupDeletedNotification({members: result.members, sender: username, groupName: result.name, groupId: result._id})
                return this.response(res, result);
            }

            return this.response(res, {"message": "Unable to delete group"}, 400);
        }catch(err){
            console.log("Error in GroupsController.js at deleteTrip: ", err)
            return this.response(res, {"message": "Unable to delete trip", error: err}, 400);
        }
    }

    async markTripActive(req, res){
        try{
            let { n } = req.query;
            let username = this.getUserName();
            
            let count = await Trips.find({name: n}).count();
            if(count != 1){
                return this.response(res, {"message": "Invalid trip provided"});
            }

            await Trips.updateMany({username: username}, {$set: {"isActive": false}});

            let result = await Trips.findOneAndUpdate({username: username, name: n}, {$set: {"isActive": true}}, {new: true});

            return this.response(res, result);

        }catch(err){
            return this.response(res, {"message": "Unable to update trip", error: err});
        }
    }

    async manageMembersToGroup(req, res){
        try{
            let username = req.user.username;
            let { member, groupName, operation, groupId } = req.body;
            if(!operation)
                operation = 'add';
            if(!groupId || !member || !username){
                return this.response(res, {
                    "message": "Invalid details provided to update the group."
                }, 400)
            }

            let d = {$addToSet: {members: {"username": member}}};
            let q = {_id: groupId, "members.username": {$nin: [member]}};
            
            if(operation == 'remove'){
                q["members.username"] = {$in: [member]};
                d = {$pull: {members: {username: member}}}
            }
            
            let trip = await Trips.findOneAndUpdate(q, d, {new: true, useFindAndModify: false});
            console.log("trip", trip);
            if(trip){
                if(operation == "add"){
                    await userAddedNotification({members: trip.members, updatedMember: member, sender: username, groupName: groupName, groupId: trip._id});
                }else{
                    await userRemovedNotification({members: [...trip.members, {username: member}], sender: username, updatedMember: member, groupName: groupName, groupId: trip._id});
                }

                return this.response(res, trip);
            }
            return this.response(res, {"message": "Unable to update trip"}, 400);
        }catch(err){
            console.log("Error in trips.js controller in manageMembersToGroup",err);
            return this.response(res, {"message": "Unable to update trip", error: err}, 400);
        }
    }

    leaveGroup = async (req, res) => {
        try{
            let username = req.user.username;
            let groupname = req.body.groupName;
            let group = Trips.findOneAndUpdate({name: groupname, "members.username": {$in: [username]}}, 
            {$pull: {members: {username: username}}}, {new: false, useFindAndModify: false})
            if(group){
                await userLeftNotifiction({member: group.members, sender: username, groupName: groupname, groupId: group._id})
                return this.response(res, group);
            }
            return this.response(res, {"message": "Unable to leave group"}, 400)
        }catch(err){
            console.log("Error in trips.js controller in manageMembersToGroup",err);
            return this.response(res, {"message": "Unable to leave group", error: err}, 400);
        }
    }
}

export default TripsController;