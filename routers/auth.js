const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// -------------------Token 생성-------------------
const generateAccessToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN, {
    expiresIn: "1m",
    issuer: "sungyoon",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN, {
    expiresIn: "2d",
    issuer: "sungyoon",
  });
};
// ----------------------------------------------
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
// ----------------------------------------------
let refreshTokens = [];
// -------------------Token 새로고침-------------------
router.post("/refresh", async (req, res) => {
  const userId = req.body.email;
  //사용자로부터 새로고침 토큰을 받습니다.
  try {
    const user = await User.find({ email: userId });
    const refreshToken = req.body.token;
    //토큰이 없거나 유효하지 않으면 오류를 보냅니다.
    !refreshToken && res.status(401).json("인증되지 않았습니다!");
    if (refreshTokens.includes(refreshToken)) {
      return res.status(403).json("새로고침 토큰이 유효하지 않습니다!");
    }
    // //모든 것이 정상이면 새 액세스 토큰을 생성하고 토큰을 새로고침하여 사용자에게 보냅니다.
    if (user.token === refreshToken) {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (error, user) => {
        error && console.log(error);

        const newAccessToken = generateAccessToken(user);

        return res.status(200).json(newAccessToken);
      });
    } else {
      return res.status(403).json("새로고침 토큰이 유효하지 않습니다!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------
// router.post("/refresh", async (req, res) => {
//   const userId = req.params.id;
//   //사용자로부터 새로고침 토큰을 받습니다.

//   const refreshToken = req.body.token;
//   //토큰이 없거나 유효하지 않으면 오류를 보냅니다.
//   !refreshToken && res.status(401).json("인증되지 않았습니다!");
//   if (refreshTokens.includes(refreshToken)) {
//     return res.status(403).json("새로고침 토큰이 유효하지 않습니다!");
//   }
//   //모든 것이 정상이면 새 액세스 토큰을 생성하고 토큰을 새로고침하여 사용자에게 보냅니다.

//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (error, user) => {
//     error && console.log(error);
//     refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

//     const newAccessToken = generateAccessToken(user);
//     const newRefreshToken = generateRefreshToken(user);

//     refreshTokens.push(newRefreshToken);
//     res.status(200).json({
//       accessToken: newAccessToken,
//       refreshToken: newRefreshToken,
//     });
//   });
// });
// ----------------------------------------------
// ----------------------------------------------
// -------------------회원가입--------------------
router.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(req.body.password, salt);
  const newUser = new User({
    email: req.body.email,
    password: passwordHash,
    name: req.body.name,
    address: req.body.address,
    developer: req.body.developer,
  });
  try {
    await newUser.save();
    res.status(200).json(newUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------

// --------------------login--------------------------
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(400).json("찾는 아이디가 없음");
    const password = await bcrypt.compare(req.body.password, user.password);
    !password && res.status(400).json("비밀번호가 다릅니다.");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);
    await User.findByIdAndUpdate(
      { _id: user._id },
      { $set: { token: refreshToken } }
    );
    //refreshToken db저장

    res.status(200).json({ refreshToken, accessToken, user });
  } catch (err) {
    res.status(500).json(err);
  }
});
// ----------------------------------------------
// -----------------Logout-----------------------------
router.post("/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("로그아웃 되었습니다.");
});
// -----------------------------------------------------
module.exports = router;
