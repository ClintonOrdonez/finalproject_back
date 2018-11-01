// Pull in all dependencies
let express = require("express");
let bodyParser = require("body-parser");
let cors = require("cors");
let morgan = require("morgan");
let mongoose = require("mongoose");

// Initialize and setup express
let app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

// Import the Secret model
// require("./models/Secret");

// Import the routes
app.use(require("./routes"));

// Easy to refer to long string, connection to our mongodb
let mongoDB = "mongodb://user:password1@ds115753.mlab.com:15753/clinton";

// Connect to the database
mongoose.connect(
  mongoDB,
  { useNewUrlParser: true }
);

// Get the connections
let db = mongoose.connection;
// On an error, output to the console
db.on("error", error => console.log("Connection Error: " + error));
// On connections open, output and tell app we are ready
db.once("open", () => {
  console.log("Connected to database...");
  // Broadcast a ready event
  app.emit("ready");
});

// Listen to the ready event
app.on("ready", () => {
  // Setup out app to listen on a port and start up
  let server = app.listen(process.env.PORT || 8080, () => {
    let port = server.address().port;
    // Output to console the port being used
    console.log("Running on port", port);
  });
});
