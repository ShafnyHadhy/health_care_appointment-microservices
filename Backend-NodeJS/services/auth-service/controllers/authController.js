const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const generateToken = (userId, role, refId) => {
  return jwt.sign({ userId, role, refId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const register = async (req, res) => {
  try {
    const { email, password, role, refId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists in auth-service" });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      refId: refId.toString(),
    });

    const token = generateToken(user._id, user.role, user.refId);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        refId: user.refId,
      },
    });
  } catch (error) {
    console.error("Auth Register Error:", error);
    res
      .status(500)
      .json({ message: "Server Error in auth-service", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for email:", email);

    const user = await User.findOne({ email });

    console.log("User found in auth-service:", user ? user.email : "No user");

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id, user.role, user.refId);
      const userPayload = {
        id: user._id,
        email: user.email,
        role: user.role,
        refId: user.refId,
      };

      // Send login notification asynchronously (non-blocking)
      if (process.env.NOTIFICATION_SERVICE_URL) {
        axios
          .post(
            `${process.env.NOTIFICATION_SERVICE_URL}/api/notify/login`,
            { email: user.email },
            { timeout: 3000 },
          )
          .catch((err) =>
            console.warn(
              "Failed to send login notification:",
              err.response?.data?.message || err.message,
            ),
          );
      }

      // Return BOTH shapes to avoid breaking older frontend code
      res.json({
        message: "Logged in successfully",
        token,
        user: userPayload,
        data: {
          userId: user._id,
          email: user.email,
          role: user.role,
          refId: user.refId,
          token,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { register, login };
