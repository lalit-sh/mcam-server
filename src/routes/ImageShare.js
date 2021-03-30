import Controller from "../controllers/ImageShareController";

module.exports = app => {
    let ImageShare = new Controller();

    app.route(`${process.env.API_BASE}newImage`).post(ImageShare.processNewImageClicked);
}