const jwt = require("jsonwebtoken");

const tokenVerify = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader) {
    return res.status(400).json({ message: "You are not authorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    req.email = decode.email;
    req.role = decode.role;

    next();
  });
};

module.exports = tokenVerify;
