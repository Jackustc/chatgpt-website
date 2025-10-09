const express = require("express");
const Conversation = require("../models/Conversation");
const authMiddleware = require("../utils/authMiddleware");

const jwt = require("jsonwebtoken");
const { Parser } = require("json2csv");

const { OpenAI } = require("openai");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 保存对话并调用 ChatGPT
// 保存对话并调用 ChatGPT
router.post("/conversation", async (req, res) => {
  try {
    const { prompt, sessionId: clientSessionId } = req.body;
    let userId = null;

    // 解析 token（可选）
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "secretkey"
        );
        userId = decoded.id;
      } catch (err) {
        console.warn("⚠️ Visitor mode: token invalid", err.message);
      }
    }

    // 统一会话ID：若客户端未提供则生成一个
    const sessionId =
      typeof clientSessionId === "string" && clientSessionId.length <= 128
        ? clientSessionId
        : uuidv4();

    // 调用 OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });
    const response = completion.choices[0].message.content;

    // 存数据库（无论是否登录，均写入 sessionId）
    const newConv = await Conversation.create({
      userId,
      sessionId,
      prompt,
      response,
    });

    // 回传时务必带上 sessionId（前端首次请求后保存到内存）
    res.status(201).json({ ...newConv.toJSON(), sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 获取对话
router.get("/conversation", async (req, res) => {
  try {
    let userId = null;
    const sessionId =
      typeof req.query.sessionId === "string" ? req.query.sessionId : null;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "secretkey"
        );
        userId = decoded.id;
        // console.log("✅ userId:", userId);
      } catch (err) {
        console.warn("⚠️ Visitor mode: token invalid", err.message);
      }
    }

    let where = {};
    if (userId) {
      // 登录用户默认看自己全部历史
      where.userId = userId;
    } else if (sessionId) {
      // 无登录但带了会话ID → 只看该会话
      where.sessionId = sessionId;
    } else {
      // 匿名且未提供 sessionId → 无法判断是哪段会话
      return res.json([]);
    }

    const conversations = await Conversation.findAll({
      where,
      order: [["createdAt", "ASC"]], // 会话内按时间正序更自然
    });

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
      sessionId: c.sessionId,
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
      order: [
        ["sessionId", "ASC"],
        ["createdAt", "ASC"], // ✅ 按 session + 时间排序
      ],
    });

    // 将相同 session 分组，加上视觉分隔
    const formatted = [];
    let currentSession = null;

    for (const c of conversations) {
      if (c.sessionId !== currentSession) {
        formatted.push({
          id: "",
          sessionId: `=== SESSION ${c.sessionId.slice(0, 8)} ===`, // ✅ 标题行
          username: "",
          email: "",
          prompt: "",
          response: "",
          createdAt: "",
        });
        currentSession = c.sessionId;
      }

      formatted.push({
        id: c.id,
        sessionId: c.sessionId.slice(0, 8), // ✅ 更短
        username: c.User ? c.User.username : "Visitor",
        email: c.User ? c.User.email : "",
        prompt: c.prompt,
        response: c.response,
        createdAt: c.createdAt.toISOString(),
      });
    }

    const parser = new Parser({
      fields: [
        "id",
        "sessionId",
        "username",
        "email",
        "prompt",
        "response",
        "createdAt",
      ],
    });
    const csv = parser.parse(formatted);

    res.header("Content-Type", "text/csv");
    res.attachment("conversations_grouped.csv");
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
