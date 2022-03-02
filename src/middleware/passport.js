import { Strategy } from "passport-local";
import User from "../models/users";

const config = passport => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new Strategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    }, (req, username, password, done) => {
        if (username)
            username = username.toLowerCase();
        
        process.nextTick(function() {
            User.findOne({ 'local.username' :  username }, function(err, user){
                if (err)
                    return done(err);
                
                if (!user)
                    return done(null, false);
                
                if (!user.validPassword(password))
                    return done(null, false);
                else
                    return done(null, user);
            });
        });
    }));

    passport.use('local-signup', new Strategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    }, function(req, username, password, done) {
        if (username)
            username = username.toLowerCase();

        process.nextTick(function() {
            if (!req.user) {
                User.findOne({ 'local.username' :  username }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false);
                    } else {
                        var newUser            = new User();
                        newUser.local.username    = username;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }
                });
            }else if ( !req.user.local.username ) {
                User.findOne({ 'local.username' :  username }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false);
                    } else {
                        var user = req.user;
                        user.local.username = username;
                        user.local.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);

                            return done(null,user);
                        });
                    }
                });
            }else{
                return done(null, req.user);
            }
        });
    }));
}

module.exports = config;