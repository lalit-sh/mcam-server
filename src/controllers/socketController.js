import BaseController from "./baseController";

class SocketController extends  BaseController {
    constructor(socket, model){
        super();
        this.socket = socket;
        this.model = model;
    }

    processNewImageClicked(data){
    
        if(!data.url || !data.trip || !data.username || !data.key || !data.members || data.members.length < 1){
            return false;
        }

        let { url, members, trip, username, key } = data;
        // let m = members.map(el => ({name: el, isDelivered: false}));
        
        this.model.newImage({
            username: username,
            tripname: trip,
            imageKey: key,
            imageUrl: url,
            members: members
        });

        this.socket.to()
    }
    
}

export default SocketController;