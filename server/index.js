const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const routes = require("./routes/index.js");
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

//console.log colors
let yellow = "\x1b[33m%s\x1b[0m";
let green = "\x1b[32m%s\x1b[0m";
let magenta = "\x1b[35m%s\x1b[0m";
let cyan = "\x1b[36m%s\x1b[0m";

//settings

//middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
let users = [];
let renderedQuestionServer = "";
let addingNewQuestionUsername = undefined;

io.on("connection", (socket) => {
    socket.join("room1");
    console.log(yellow, socket.id, "user connected");

    socket.on("reload", (bolean) => {
        if (bolean) {
            io.to("room1").emit("newUser", users);
            io.to("room1").emit("renderedQuestionClient", renderedQuestionServer);
            io.to("room1").emit("addingNewQuestion", addingNewQuestionUsername);
        }
    });

    socket.on("addingNewQuestion", (socketId) => {
        if (socketId) {
            addingNewQuestionUsername = users.filter((user) => user.socketId === socketId)[0].name;
            io.to("room1").emit("addingNewQuestion", addingNewQuestionUsername);
        } else {
            addingNewQuestionUsername = undefined;
            io.to("room1").emit("addingNewQuestion", addingNewQuestionUsername);
        }
    });

    socket.on("newUser", (newUser) => {
        users.push(newUser);
        console.log("users", users);
        io.to("room1").emit("newUser", users);
        io.to("room1").emit("renderedQuestionClient", renderedQuestionServer);
    });

    socket.on("renderedQuestionServer", (renderedQuestion) => {
        io.to("room1").emit("renderedQuestionClient", renderedQuestion);
        renderedQuestionServer = renderedQuestion;
        console.log(renderedQuestionServer, "renderedQuestion");
    });

    socket.on("disconnect", (reason) => {
        console.log(magenta, socket.id, "user disconnected", reason);
        users = users.filter((user) => user.socketId !== socket.id);
        io.to("room1").emit("newUser", users);
        console.log("users", users);
        if (users.length === 0) renderedQuestionServer = "";
    });
});

server.listen(process.env.PORT || 3001, () => {
    console.log(cyan, process.env.PORT ? `listening on ${process.env.PORT}` : `listening on 3001`);
});
