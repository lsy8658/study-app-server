const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRouter = require("./routers/auth");
const userRouter = require("./routers/user");
const studyRouter = require("./routers/study");
const projectRouter = require("./routers/project");
const chatRouter = require("./routers/chat");

const cookieParser = require("cookie-parser");
const http = require("http");
const server = http.createServer(app);
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(morgan("common"));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.json("안녕하세요 study-app server입니다.");
});
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB 연결 완료");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/study", studyRouter);
app.use("/api/project", projectRouter);
app.use("/api/chat", chatRouter);

// ----------------채팅-------------------------
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methohs: ["GET", "POST"],
  },
});
// io.configure(function () {
//   io.set("transports", ["websocket", "polling"]);
//   io.set("polling duration", 10);
// });
// node와 소켓이 같은 포트에서 동작해야한다..! 포트가 달라서..에러가
// -----------------------------------------
io.on("connection", (socket) => {
  // console.log(`User connection ID : ${socket.id}`);
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID : ${socket.id} 참여방 : ${data}`);
  });
  socket.on("send_message", async (data) => {
    // console.log(data);

    socket.to(data.room).emit("receive_message", data);
  });
  socket.on("out_room", (data) => {
    socket.leave(data);
  });
  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
  });
  socket.on("error", (error) => {
    console.log(`에러 발생: ${error}`);
  });
});
// -----------------------------------------
// const port = process.env.PORT || 3000;
server.listen(process.env.PORT || 3000, () => {
  console.log("서버에 연결되었습니다.");
});
