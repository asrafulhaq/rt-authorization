const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * @desc login user Request
 * @route POST /auth/login
 * @access PUBLIC
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check user
  const loginUser = await User.findOne({ email });

  if (!loginUser) {
    return res.status(400).json({ message: "Login user not found" });
  }

  // password check
  const passCheck = await bcrypt.compare(password, loginUser.password);

  if (!passCheck) {
    return res.status(400).json({ message: "Wrong password" });
  }

  // access token
  const accessToken = jwt.sign(
    { email: loginUser.email, role: loginUser.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30s",
    }
  );

  // refresh token
  const refreshToken = jwt.sign(
    { email: loginUser.email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );

  // now set RT to cookie
  res
    .cookie("rtToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    })
    .json({ token: accessToken });
});

/**
 * @desc Create Refresh token
 * @route GET /auth/refresh
 * @access PUBLIC
 */
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.rtToken) {
    return res.status(400).json({ message: "You are not authorize" });
  }

  const token = cookies.rtToken;

  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decode) => {
      if (err) {
        return res.status(400).json({ message: "Invalid Token request" });
      }

      const tokenUser = await User.findOne({ email: decode.email });

      if (!tokenUser) {
        return res.status(400).json({ message: "Invalid User request" });
      }

      // access token
      const accessToken = jwt.sign(
        { email: tokenUser.email, role: tokenUser.role },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "30s",
        }
      );

      res.json({ token: accessToken });
    })
  );
};

/**
 * @desc user logout
 * @route POST /auth/logout
 * @access PUBLIC
 */

const logout = (req, res) => {
  const cookies = req.cookies;

  if (!cookies.rtToken) {
    return res.status(400).json({ message: "Cookie not found" });
  }

  res
    .clearCookie("rtToken", { httpOnly: true, secure: false })
    .json({ message: "User logged out" });
};

// export
module.exports = { login, refresh, logout };
