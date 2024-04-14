const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user.js");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: payload._id }).select("-password");

      if (!user) {
        return res.status(401).json({ error: "User not found!" });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ error: "Unauthorized!" });
    }
  } else {
    return res.status(403).json({ error: "Forbidden 🛑🛑" });
  }
};