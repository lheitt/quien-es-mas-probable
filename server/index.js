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
const axios = require("axios");

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
let users = {};
let renderedQuestionServer = {};

let axiosBaseURL = process.env.HEROKU_URL || "http://localhost:3001";

const getQuestions = async (serverCode, maxQuestions) => {
    await axios({
        method: "get",
        url: `${axiosBaseURL}/questions`,
        data: {
            serverCode: serverCode,
            maxQuestions: maxQuestions,
        },
    });
};

const deleteQuestions = async (serverCode) => {
    await axios.post(`${axiosBaseURL}/delete-questions`, { serverCode: serverCode });
};

io.on("connection", (socket) => {
    socket.on("reload", (props) => {
        if (props.bolean) {
            let usersRoom;
            for (const room in users) {
                users[room].forEach((user) => {
                    if (user.socketId === props.socketId) usersRoom = room;
                });
                if (usersRoom !== undefined) break;
            }

            io.to(usersRoom).emit("reload", { users: users[usersRoom], room: usersRoom });
            io.to(usersRoom).emit("renderedQuestionClient", renderedQuestionServer[usersRoom]);
        }
    });

    socket.on("newUser", async (newUser) => {
        if (users.hasOwnProperty(newUser.room)) {
            users[newUser.room].push({
                name: newUser.name,
                socketId: newUser.socketId,
            });
        } else {
            users[newUser.room] = [
                {
                    name: newUser.name,
                    socketId: newUser.socketId,
                },
            ];

            await getQuestions(newUser.room, newUser.maxQuestions);
        }

        socket.join(newUser.room);
        console.log(yellow, `user ${newUser.name} connected to room ${newUser.room}`);

        io.to(newUser.room).emit("newUser", { users: users[newUser.room], room: newUser.room });
        io.to(newUser.room).emit("renderedQuestionClient", renderedQuestionServer[newUser.room]);

        console.log("users", users);
    });

    socket.on("renderedQuestionServer", (props) => {
        let usersRoom;
        for (const room in users) {
            users[room].forEach((user) => {
                if (user.socketId === props.socketId) usersRoom = room;
            });
            if (usersRoom !== undefined) break;
        }

        renderedQuestionServer[usersRoom] = props.renderedQuestion;
        io.to(usersRoom).emit("renderedQuestionClient", renderedQuestionServer[usersRoom]);
        // console.log(renderedQuestionServer, "renderedQuestion");
    });

    socket.on("disconnect", (reason) => {
        let usersRoom;
        let userName;
        for (const room in users) {
            users[room].forEach((user) => {
                if (user.socketId === socket.id) {
                    usersRoom = room;
                    userName = user.name;
                }
            });
            if (usersRoom !== undefined) break;
        }

        console.log(magenta, `user ${userName} disconnected from room ${usersRoom}, reason: ${reason}`);
        users[usersRoom] = users[usersRoom].filter((user) => user.socketId !== socket.id);

        io.to(usersRoom).emit("newUser", { users: users[usersRoom], room: usersRoom });

        if (users[usersRoom].length === 0) {
            delete users[usersRoom];
            delete renderedQuestionServer[usersRoom];
            deleteQuestions(usersRoom);
        }

        console.log("users", users);
    });
});

server.listen(process.env.PORT || 3001, () => {
    console.log(cyan, process.env.PORT ? `listening on ${process.env.PORT}` : `listening on 3001`);
});
