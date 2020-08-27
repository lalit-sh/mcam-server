import Controller from "../controllers/socketController";
import Images from "../models/images";


module.exports = (socket) => {
    let SocketController = new Controller(socket, Images);

    let newImage = (data) => SocketController.processNewImageClicked(data);
    socket.on("NEW_IMAGE", newImage);
}