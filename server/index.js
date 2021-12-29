const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

app.get("/", (req, res) => {
    res.send("<h1>Hola mundo!</h1>");
});

io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("disconnect", () => {
        console.log("a user disconnected")
    })
});

server.listen(3001, () => {
    console.log("listening on *:3001");
});
