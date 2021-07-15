import Controller from "../controllers/UsersController";

module.exports = app => {

    let AuthController = new Controller();
    const getUserDetails = (req, res) => {
        AuthController.getUserDetails(req, res);
    }
    
    const updateUser = (req, res) => AuthController.updateUser(req, res);
    const getUserContacts = (req, res) => AuthController.getUserContacts(req, res);
    
    app.route(process.env.API_BASE + "users").get(getUserDetails);
    app.route(process.env.API_BASE + "users").post(updateUser);
    app.route(process.env.API_BASE + "users/contacts").get(getUserContacts);
    app.route(process.env.API_BASE + "users/contacts").post(AuthController.syncUserContacts);
    app.route(process.env.API_BASE + "users/updateFCMToken").post(AuthController.updateFCMToken);
}