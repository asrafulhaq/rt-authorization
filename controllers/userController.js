const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

/**
 * @desc get all users data
 * @route GET /users
 * @access PUBLIC
 */
const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  console.log(req.email + req.role);
  if (!users?.length) {
    return res.status(400).json({ message: "Not user found" });
  }

  res.json(users);
});

/**
 * @desc get Single users data
 * @route GET /users/:id
 * @access PUBLIC
 */
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password").lean();

  if (!user) {
    return res.status(400).json({ message: "No user found" });
  }

  res.json(user);
});

/**
 * @desc create new user
 * @route POST /users
 * @access PUBLIC
 */
const createUser = asyncHandler(async (req, res) => {
  // get data
  const { name, email, password, role } = req.body;

  // check validation
  if (!name || !password || !email || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // email existance
  const emailCheck = await User.findOne({ email });

  if (emailCheck) {
    return res.status(400).json({ message: "Email already exists" });
  }

  // hash password
  const hash = await bcrypt.hash(password, 10);

  // create new user data
  const user = await User.create({ name, email, role, password: hash });

  // check
  if (user) {
    return res.status(201).json({ message: "User created successful", user });
  } else {
    return res.status(400).json({ message: "Invalid user data" });
  }
});

/**
 * @desc delete user data
 * @route DELETE /users/:id
 * @access PUBLIC
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return res.status(400).json({ message: "User delete failed" });
  }

  res.json(user);
});

/**
 * @desc update user data
 * @route PATCH /users/:id
 * @access PUBLIC
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { name, email, password, role } = req.body;

  // validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  user.name = name;
  user.email = email;
  user.password = await bcrypt.hash(password, 10);
  user.role = role;

  const updateUserData = await user.save();

  res.json({ message: `User updated successfull`, user: updateUserData });
});

// export methods
module.exports = {
  getAllUser,
  createUser,
  getSingleUser,
  deleteUser,
  updateUser,
};
