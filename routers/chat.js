const router = require("express").Router();
const ChatRoom = require("../models/chatroom");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// -------------------Token 유효성 검사-------------------
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if (authHeader) {
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, user) => {
      if (error) {
        res.status(403).json("토큰이 유효하지 않습니다.");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("접근 권한이 없습니다.");
  }
};
// ------------------------------------------------------------
// ----------------참여중인 chat가져오기------------------------
router.post("/getList", verify, async (req, res) => {
  const email = req.body.email;
  const data = await ChatRoom.find({ members: { email: email } });
  try {
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ------------------------------------------------------------
// ----------------chat 생성하기------------------------
router.post("/create", verify, async (req, res) => {
  const newChatRoom = new ChatRoom({
    type: req.body.type,
    title: req.body.title,
    projectId: req.body.projectId,
    members: req.body.members,
  });
  try {
    await newChatRoom.save();
    res.status(200).json(newChatRoom);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ------------------------------------------------------------
// -----------------------chat 참여시키기-------------------------------------

router.post("/participate", verify, async (req, res) => {
  const projectId = req.body.projectId;
  const email = req.body.email;
  try {
    const data = await ChatRoom.updateOne(
      { projectId: projectId },
      {
        $push: {
          members: { email: email },
        },
      },
      { new: true }
    );
    res.status(200).json(projectId);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ------------------------------------------------------------
// --------------------------제외시키기----------------------------------
router.post("/exclude", verify, async (req, res) => {
  const projectId = req.body.projectId;
  const email = req.body.email;
  try {
    const data = await ChatRoom.updateOne(
      { projectId: projectId },
      {
        $pull: {
          members: { email: email },
        },
      },
      { new: true }
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ------------------------------------------------------------
// ------------------------chat저장------------------------------------
router.post("/sendChat", verify, async (req, res) => {
  const projectId = req.body.room;
  const email = req.body.email;
  try {
    const data = await ChatRoom.updateOne(
      { projectId: projectId },
      {
        $push: {
          chat: {
            email: email,
            chat: req.body.chat,
            time: req.body.time,
            name: req.body.name,
          },
        },
      },
      { new: true }
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ------------------------------------------------------------
// ------------------------------------------------------------
// ------------------------------------------------------------
module.exports = router;
