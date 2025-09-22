const express = require("express");
const Conversation = require("../models/Conversation");
const authMiddleware = require("../utils/authMiddleware");

const { OpenAI } = require("openai");

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 保存对话并调用 ChatGPT
router.post("/conversation", authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;

    // 调用 OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const response = completion.choices[0].message.content;

    // 存数据库
    const newConv = await Conversation.create({
      userId: req.user.id,
      prompt,
      response,
    });

    res.status(201).json(newConv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 获取当前用户的对话
router.get("/conversation", authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
