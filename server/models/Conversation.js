const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const User = require("./User");

const Conversation = sequelize.define(
  "Conversation",
  {
    sessionId: {
      type: DataTypes.STRING,
      allowNull: false, // ✅ 关键：任何对话都必须属于一个会话
    },
    prompt: { type: DataTypes.TEXT, allowNull: false },
    response: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["sessionId"] }, // ✅ 建议加索引，便于会话内查询
      { fields: ["userId"] },
    ],
  }
);

Conversation.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: true, // 允许为空，否则不能 SET NULL
  },
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

module.exports = Conversation;
