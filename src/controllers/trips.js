import Trips from "../models/trips";
import BaseController from "./baseController";
import app from "../../app";

class TripsController extends BaseController{

    async createNewTrip(req, res){
        let { name, members } = req.body;
        let username = this.getUserName();

        try{
            let d = {
                name: name,
                username: username,
                members: members,
                status: 'Active',
                isActive: true
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
        let { tripName, readDeleted, limit, skip } = req.query;
        let username = this.getUserName();

        try{
            let condition = {'username': username, status: 'Active'};
            
            if(readDeleted && readDeleted === true){
                delete condition["status"];
            }

            if(tripName && typeof tripName == "string")
                condition.name = tripName;

            const trip = await Trips.find({ "username": username }).limit(limit).skip(skip).sort({created_at: -1});
            return this.response(res, trip);
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
            let { trips } = req.body;
            let username = this.getUserName();

            if(!trips || (Array.isArray(trips) && trips.length < 1) ){
                return this.response(res, {"message": "missing parameter trip"})
            }

            if(!Array.isArray(trips) && typeof trips == "string"){
                trips = [trips];
            }

            let trip = await Trips.remove({username: username,  name: {$in: trips}});
            return this.response(res, trip);
        }catch(err){
            return this.response(res, {"message": "Unable to delete trip", error: err});
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
}

export default TripsController;