import Controller from "../controllers/UsersController";

module.exports = app => {

    let AuthController = new Controller();
    const login = (req, res) => {
        AuthController.login(req, res);
    }
    const signup = (req, res) => {
        AuthController.signup(req, res);
    }
    app.route(process.env.API_BASE + "auth/login").post(login);
    app.route(process.env.API_BASE + "auth/signup").post(signup);
}