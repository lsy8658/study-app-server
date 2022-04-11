const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Project = require("../models/project");
const User = require("../models/user");
const Chat = require("../models/chatroom");
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if (authHeader) {
    jwt.verify(token, process.env.ACCESS_TOKEN, (error, user) => {
      if (error) {
        return res.status(403).json("토큰이 유효하지 않습니다.");
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("접근 권한이 없습니다.");
  }
};
// -------------------project 생성--------------------------
router.post("/create", verify, async (req, res) => {
  const newProject = new Project({
    area: req.body.area,
    deadline: req.body.deadline,
    headCount: req.body.headCount,
    language: req.body.language,
    meet: req.body.meet,
    title: req.body.title,
    master: req.body.master,
    member_id: { user: req.body.master, waiting: true, grade: false },
    desc: req.body.desc,
  });
  try {
    const data = await newProject.save();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------------

// -------------------개인 project 가져오기--------------------------

router.get("/myProject", verify, async (req, res) => {
  try {
    const data = await Project.save();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------프로젝트에 포함되어있으면 -------------------------

// ------------------모든 project 불러오기----------------------------------
router.get("/getProject", async (req, res) => {
  try {
    const data = await Project.find({}).sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------------
// --------------------새로운 프로젝트 2개정도 불러오기--------------------------------
router.get("/newProject", async (req, res) => {
  try {
    const data = await Project.find().sort({ createdAt: -1 }).limit(2);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------------
//-------현재 진행중인 Project만 가져오기----------
router.get("/Projecting", async (req, res) => {
  try {
    const data = await Project.find({ success: false }).sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ---------------------------------------------
// -----------------------프로젝트 완료-----------------------------
router.put("/updateUrl/:id", verify, async (req, res) => {
  const projectId = req.params.id;
  try {
    const data = await Project.findByIdAndUpdate(
      { _id: projectId },
      {
        $set: { url: req.body.url, success: true },
      }
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------------
// ----------------------검색------------------------------
router.post("/search", async (req, res) => {
  const text = req.body.text;
  const caseText = text.toLowerCase();
  const data = await Project.find({}).sort({ createdAt: -1 });
  const filter = await data.filter((item) => {
    return item.title.toLowerCase().indexOf(caseText) !== -1;
  });
  try {
    res.status(200).json(filter);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------------
// -----------------------프로젝트 참여하기-----------------------------
router.post("/participate/:id", verify, async (req, res) => {
  const projectId = req.params.id;

  try {
    const data = await Project.findByIdAndUpdate(
      { _id: projectId },
      {
        $push: {
          member_id: req.body,
        },
      },
      { new: true }
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ----------------------------------------------------
// ---------------------거절하기------------------------
router.post("/refuse/:id", verify, async (req, res) => {
  const projectId = req.params.id;
  const userId = req.body.email;
  try {
    const data = await Project.findByIdAndUpdate(
      { _id: projectId },
      {
        $pull: {
          member_id: { user: userId },
        },
      },
      { new: true }
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// -----------------------대기자 수락하기 ------------------------------
router.post("/accept/:id", verify, async (req, res) => {
  const projectId = req.params.id;
  const userId = req.body.email;

  const data = await Project.findByIdAndUpdate(
    { _id: projectId },
    {
      $pull: {
        member_id: { user: userId },
      },
    }
  );
  try {
    const updateData = await Project.findByIdAndUpdate(
      { _id: projectId },
      {
        $push: {
          member_id: { user: userId, waiting: true, grade: false },
        },
      },
      { new: true }
    );
    res.status(200).json(updateData);
  } catch (err) {
    res.status(500).json(err);
  }
});
// -----------------------------------------------------
// ---------------내가 참여하고있는 project--------------
router.post("/myProject", async (req, res) => {
  const email = req.body.email;
  try {
    const data = await Project.find({
      success: false,
      $or: [
        { member_id: { $in: { user: email, waiting: true, grade: false } } },
        { member_id: { $in: { user: email, waiting: true, grade: true } } },
      ],
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// -----------------------------------------------------
// ---------------내가 참여했던 project------------------
router.post("/mySuccessProject", async (req, res) => {
  const email = req.body.email;
  try {
    const data = await Project.find({
      success: true,
      $or: [
        { member_id: { $in: { user: email, waiting: true, grade: false } } },
        { member_id: { $in: { user: email, waiting: true, grade: true } } },
      ],
    });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// -------------------------포기하기 평점부과(다른 유저)----------------------------
router.post("/abandonment/:id", async (req, res) => {
  const email = req.body.email;
  const project_id = req.params.id;
  try {
    const data = await Project.findByIdAndUpdate(
      { _id: project_id },
      {
        $pull: {
          member_id: { user: email },
        },
      }
    );

    const userGrade = await User.updateOne(
      { email: email },
      {
        $push: {
          grade: 1,
        },
      }
    );

    res.status(200).json(data, userGrade);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------------------------------
// ---------------------------포기하기 평점부과(방장)----------------------------

router.post("/projectAbandon/:id", async (req, res) => {
  const email = req.body.email;
  const project_id = req.params.id;
  try {
    const data = await Project.findByIdAndDelete({ _id: project_id });

    const userGrade = await User.updateOne(
      { email: email },
      {
        $push: {
          grade: 1,
        },
      }
    );
    const chatDelete = await Chat.deleteOne({
      projectId: project_id,
    });
    res.status(200).json(data, userGrade, chatDelete);
  } catch (err) {
    res.status(500).json(err);
  }
});
// -----------------------------------------------------------------------------
// ---------------------팀원 평가------------------------
router.post("/evaluation", verify, async (req, res) => {
  const email = req.body.email;
  const grade = req.body.grade;
  try {
    const data = await User.updateOne(
      { email: email },
      {
        $push: {
          grade: Number(grade),
        },
      }
    );

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------------
// ---------------------팀원 평가 버튼 없애기------------------------
router.post("/gradeTrue/:id", verify, async (req, res) => {
  const projectId = req.params.id;
  const userId = req.body.email;

  try {
    const data = await Project.findByIdAndUpdate(
      { _id: projectId },
      {
        $pull: {
          member_id: { user: userId },
        },
      }
    );
    const updateData = await Project.findByIdAndUpdate(
      { _id: projectId },
      {
        $push: {
          member_id: { user: userId, waiting: true, grade: true },
        },
      },
      { new: true }
    );
    res.status(200).json(userId);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------------
module.exports = router;
