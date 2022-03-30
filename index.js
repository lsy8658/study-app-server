const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRouter = require("./routers/auth");
const userRouter = require("./routers/user");
const studyRouter = require("./routers/study");

const cookieParser = require("cookie-parser");
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(helmet());
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("서버에 연결되었습니다.");
});
