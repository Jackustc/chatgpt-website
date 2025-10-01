const express = require("express");
const Conversation = require("../models/Conversation");
const authMiddleware = require("../utils/authMiddleware");

const jwt = require("jsonwebtoken");
const { Parser } = require("json2csv");

const { OpenAI } = require("openai");

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 保存对话并调用 ChatGPT
router.post("/conversation", async (req, res) => {
  try {
    const { prompt } = req.body;
    let userId = null;

    // 检查 token（可选）
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "secretkey"
        );
        userId = decoded.id; // ✅ 这里保证和 login 一致
      } catch (err) {
        console.warn("⚠️ Visitor mode: token invalid", err.message);
      }
    }

    // 调用 OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const response = completion.choices[0].message.content;

    // 存数据库
    const newConv = await Conversation.create({
      userId,
      prompt,
      response,
    });

    res.status(201).json(newConv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 获取对话
router.get("/conversation", async (req, res) => {
  try {
    let userId = null;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "secretkey"
        );
        userId = decoded.id;
        console.log("✅ 解析出的 userId:", userId);
      } catch (err) {
        console.warn("⚠️ Visitor mode: token invalid", err.message);
      }
    }

    let conversations = [];
    if (userId) {
      // 登录用户看自己的
      conversations = await Conversation.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });
    } else {
      conversations = [];
    }

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 获取所有对话（管理员专用）
router.get("/conversation/all", authMiddleware, async (req, res) => {
  try {
    // 只有管理员能访问
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const conversations = await Conversation.findAll({
      include: [
        {
          model: require("../models/User"),
          attributes: ["username", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 格式化返回的数据，避免太复杂
    const formatted = conversations.map((c) => ({
      id: c.id,
      prompt: c.prompt,
      response: c.response,
      createdAt: c.createdAt,
      user: c.User
        ? { username: c.User.username, email: c.User.email }
        : { username: "Visitor", email: null },
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 下载所有对话 CSV（管理员专用）
router.get("/conversation/all/csv", authMiddleware, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only" });
    }

    const conversations = await Conversation.findAll({
      include: [
        {
          model: require("../models/User"),
          attributes: ["username", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = conversations.map((c) => ({
      id: c.id,
      username: c.User ? c.User.username : "Visitor",
      email: c.User ? c.User.email : "",
      prompt: c.prompt,
      response: c.response,
      createdAt: c.createdAt,
    }));

    const parser = new Parser({
      fields: ["id", "username", "email", "prompt", "response", "createdAt"],
    });
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment("conversations.csv");
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
