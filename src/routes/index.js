import path from "path";
import fs from "fs";



module.exports = app => {
    fs.readdirSync(path.join(__dirname)).map(file => {
        if (file !== 'index.js' && file !== "socket.js") {
            require('./' + file)(app);
        }
    });

    app.get("/", (req, res) => res.status(200).json({ message: "Welcome to the metac" }));

    app.use((req, res, next) => {
        res.status(404).json({ "error": "Endpoint not found" });
        next();
    });

    app.use((error, req, res, next) => {
        if (process.env.NODE_ENV === "production") {
            return res.status(500).json({ "error": "Unexpected error: " + error });
        }
        next(error);
    });
}