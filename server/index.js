const express = require("express");
const morgan = require("morgan");
const app = express();
const http = require("http");
const server = http.createServer(app);
const routes = require("./routes/index.js");
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

//settings

//middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error catching endware.
app.use((err, req, res, next) => {
    // eslint-disable-line no-unused-vars
    const status = err.status || 500;
    const message = err.message || err;
    console.error(err);
    res.status(status).send({ message });
});

//routes
app.use("/", routes);

//socket.io
io.on("connection", (socket) => {
    socket.join("room1");
    console.log(socket.id, "user connected");

    socket.on("renderedQuestionServer", (arg) => {
        io.to("room1").emit("renderedQuestionClient", arg);
        console.log(arg, "renderedQuestionClient");
    });

    socket.on("disconnect", (reason) => {
        console.log(socket.id, "user disconnected", reason);
    });
});

server.listen(3001, () => {
    console.log("listening on *:3001");
});
