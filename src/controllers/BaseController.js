import app from "../../app";


class BaseController {
    constructor(model){
        if(model)
            this.model = model;
    }

    response(res,json, status=200){
        return res.status(status).json(json);
    }

    getUserName(){
        let username = app.get("user");
        if(username)
            username = username["username"];
        else
            throw new Error("Invalid user provided");

        return username;
    }

    inValidUserResponse = (res) => {
        return this.response(res, {message: "Invalid user"});
    }
}

export default BaseController;