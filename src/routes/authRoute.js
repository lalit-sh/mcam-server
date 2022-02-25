import controller from "../controllers/UsersController";

module.exports = app => {
    const Controller = new controller();
    app.route(process.env.API_BASE + "auth/init").post(Controller.login);
    app.route(process.env.API_BASE + "auth/login").post(Controller.verifyOTPAndGenerateToken)
}