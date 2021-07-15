var dotenv =  require('dotenv')
dotenv.config()
var express = require( "express");
var morgan = require( "morgan");
var bodyParser = require( "body-parser");
var expressValidator = require("express-validator");
var db = require( "./src/db");
const auth = require("./src/middleware/auth").default;
const port = process.env.PORT || 9004;
const path = require("path");
var forceSsl = require('express-force-ssl');
const fs = require('fs');
var minify = require('express-minify');
var compression = require('compression');
const https = require('https');
var http = require('http');
const fileUpload = require('express-fileupload');


const env = process.env.NODE_ENV;


const app = express();
module.exports = app;

app.use(fileUpload());
app.use(morgan(env));
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

app.use(express.static(path.join(__dirname, 'public')));

require("./src/routes")(app);

if(env && (env == "production" || env == "PRODUCTION")){

    app.set('forceSSLOptions', {
        enable301Redirects: true,
        trustXFPHeader: false,
        httpsPort: 443,
        sslRequiredMessage: 'SSL Required.'
    });
    app.use(forceSsl);
    app.use(compression());
    app.use(minify());

    var https_options = {
        key: fs.readFileSync(path.join(__dirname, 'ssl/private.key')),
        cert: fs.readFileSync(path.join(__dirname, 'ssl/certificate.crt')),
        ca: fs.readFileSync(path.join(__dirname, 'ssl/ca_bundle.crt')),
        secure: true
    };
    https.createServer(https_options, app).listen(443, () => {
        console.log(`working on port ${443}`);
    });
    http.createServer(app).listen(80);
}else{
    app.listen(port,function(){
        console.log(`Working on port ${port}`);
    });
}

// const io = require("socket.io")(server);
// io.sockets.on('connection', function(socket) {
//     require("./src/routes/socket.js")(socket);
// });