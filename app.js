var dotenv =  require('dotenv')
dotenv.config()
var express = require( "express");
var morgan = require( "morgan");
var bodyParser = require( "body-parser");
var expressValidator = require("express-validator");
var db = require( "./src/db");
const auth = require("./src/middleware/auth").default;
const port = process.env.PORT || 9004;

const app = express();
module.exports = app;

app.use(morgan(process.env.NODE_ENV));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());

app.use(auth.initialize());

app.all(process.env.API_BASE + "*", (req, res, next) => {
    if (req.path.includes(process.env.API_BASE + "auth")) return next();
    
    return auth.authenticate((err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            if (info.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Your token has expired. Please generate a new one" });
            } else {
                return res.status(401).json({ message: info.message });
            }
        }
        req.user = user;
        app.set("user", user);
        return next();
    })(req, res, next);
});

require("./src/routes")(app);

var server = app.listen(port, () => {
    console.log('The magic happens on port ' + port);
});

const io = require("socket.io")(server);
io.sockets.on('connection', function(socket) {
    require("./src/routes/socket.js")(socket);
});