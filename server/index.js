const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const chatRoutes = require("./routes/Chat");
app.use("/chat", chatRoutes);

const sequelize = require("./models");

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection error:", err));

const User = require("./models/User");
const Conversation = require("./models/Conversation");

// 同步模型到数据库（谨慎使用 { force: true }，会删表重建）
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ Tables synced"))
  .catch((err) => console.error("❌ Table sync error:", err));

// set route
app.get("/", (req, res) => {
  res.send("Server running");
});

//start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
