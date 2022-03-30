const generateAccessToken = (email) => {
  return jwt.sign({ email }, process.env.ACCESS_TOKEN, {
    expiresIn: "10m",
    issuer: "sungyoon",
  });
};
const generateRefreshToken = (email) => {
  return jwt.sign({ email }, process.env.REFRESH_TOKEN, {
    expiresIn: "2d",
    issuer: "sungyoon",
  });
};

const verify = (req, res, next) => {
  const authHeader = req.header.authorization;
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

module.export = generateRefreshToken;
