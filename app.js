var dotenv =  require('dotenv')
dotenv.config()
var express = require( "express");
var morgan = require( "morgan");
var bodyParser = require( "body-parser");
var expressValidator = require("express-validator");
// var db = require( "./src/db");
const auth = require("./src/middleware/auth").default;
const port = process.env.PORT || 9004;
const path = require("path");
// var forceSsl = require('express-force-ssl');
// const fs = require('fs');
var minify = require('express-minify');
var compression = require('compression');
// const https = require('https');
var http = require('http');
const cors = require('cors');
const fileUpload = require('express-fileupload');


const env = process.env.NODE_ENV;


const app = express();
module.exports = app;

var corsOptions = {
    origin: [
        "http://localhost:3000",
        "http://localhost:3001"
    ]
};

app.use(fileUpload());
app.use(morgan(':date[clf]: :method :url :status :res[content-length] - :response-time ms'))
app.use(bodyParser.json({
    verify: function(req, res, buf, encoding) {
        if (buf && buf.length) {
            req.rawBody = buf.toString(encoding || 'utf8');
        }
    }
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(cors(corsOptions));
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

app.use(express.static(path.join(__dirname, 'public')));

require("./src/routes")(app);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With");
    // res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Authorization, x-id, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});


app.use(compression());
app.use(minify());
http.createServer(app).listen(port, () => {
    console.log("Working on port ", port);
});

// const io = require("socket.io")(server);
// io.sockets.on('connection', function(socket) {
//     require("./src/routes/socket.js")(socket);
// });