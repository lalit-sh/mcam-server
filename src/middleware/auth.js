import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import User from "../models/users";

class Auth {
    initialize(){
        passport.use("jwt", this.getStrategy());
        return passport.initialize();
    }
    
    authenticate = (callback) => {
        return passport.authenticate("jwt", { 
                    session: false, 
                    failWithError: true, 
                    ignoreExpiration: true 
                }, callback);
    }

    getStrategy = () => {
        const params = {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("bearer"),
            passReqToCallback: true
        };

        return new Strategy(params, (req, payload, done) => {
            User.findOne({ "username": payload.username }, (err, user) => {
                /* istanbul ignore next: passport response */
                if (err) {
                    return done(err);
                }
                /* istanbul ignore next: passport response */
                if (user === null) {
                    return done(null, false, { message: "The user in the token was not found" });
                }

                return done(null, { _id: user._id, username: user.username });
            });
        });
    }
}

export default new Auth();