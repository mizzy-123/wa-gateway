const { config } = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const path = require("path");
const MainRouter = require("./app/routers");
const errorHandlerMiddleware = require("./app/middlewares/error_middleware");
const whatsapp = require("wa-multi-session");

config();
const db = require("./connection");

var app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");
// Public Path
app.use("/p", express.static(path.resolve("public")));
app.use("/p/*", (req, res) => res.status(404).send("Media Not Found"));

app.use(MainRouter);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || "5000";
// const HOST = "192.168.43.204";
app.set("port", PORT);
var server = http.createServer(app);
// server.listen(PORT, HOST, () => {
//   console.log("APP IS RUNNING ON " + HOST + ":" + PORT);
// });
server.on("listening", () => console.log("APP IS RUNNING ON PORT " + PORT));

server.listen(PORT);

whatsapp.onConnected((session) => {
  console.log("connected => ", session);
  const updateQuery = "UPDATE whatsapps SET status = 1 WHERE name = 'wa'";
  db.query(updateQuery, (error, result) => {
    if (error) {
      console.error("Error updating:", error);
    } else {
      console.log("Update result:", result);
    }
  });
});

whatsapp.onDisconnected((session) => {
  console.log("disconnected => ", session);
  const updateQuery = "UPDATE whatsapps SET status = 0 WHERE name = 'wa'";
  db.query(updateQuery, (error, result) => {
    if (error) {
      console.error("Error updating:", error);
    } else {
      console.log("Update result:", result);
    }
  });
});

whatsapp.onConnecting((session) => {
  console.log("connecting => ", session);
});

whatsapp.loadSessionsFromStorage();
