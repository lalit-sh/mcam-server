import Controller from "../controllers/ImageShareController";

module.exports = app => {
    let ImageShare = new Controller();

    app.route(`${process.env.API_BASE}upload_image`).post(ImageShare.uploadImageS3, ImageShare.processNewImageClicked);
}