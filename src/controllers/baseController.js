import app from "../../app";


class BaseController {
    constructor(model){
        if(model)
            this.model = model;
    }

    response(res,json){
        return res.status(200).json(json);
    }

    getUserName(){
        let username = app.get("user");
        if(username)
            username = username["username"];
        else
            throw new Error("Invalid user provided");

        return username;
    }
}

export default BaseController;