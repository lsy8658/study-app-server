const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// -------------Token 유효성 검사-------------------
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
// ----------------------------------------------------
// ----------------------------------------------------
// ----------------------------------------------------

// ---------해당 email을 가진 user 가져오기-------------
router.post("/getUser", async (req, res) => {
  const email = await User.find({ email: req.body.email });

  try {
    res.status(200).json(email);
  } catch (err) {
    res.status(500).json(err);
  }
});
// -----------params를 이용해 user 정보 가져오기----------------

router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const data = await User.findById(userId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// -----------암호수정----------------

router.put("/password/:id", verify, async (req, res) => {
  const userId = req.params.id;
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const user = await User.findOne({ _id: userId });
  try {
    const data = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { password: hashPassword } },
      { new: true }
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
// -----------------------------------
// -----------정보 수정----------------
router.put("/modify/:id", verify, async (req, res) => {
  const userId = req.params.id;

  try {
    const data = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          name: req.body.name,
          address: req.body.address,
          developer: req.body.developer,
        },
      },
      { new: true }
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
