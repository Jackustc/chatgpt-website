const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const { v4: uuidv4 } = require("uuid");
const User = require("./User");

const Conversation = sequelize.define(
  "Conversation",
  {
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: false, // ✅ 保持必须
      defaultValue: () => uuidv4(), // ✅ Sequelize 自动生成
    },
    prompt: { type: DataTypes.TEXT, allowNull: false },
    response: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    timestamps: true,
    indexes: [{ fields: ["sessionId"] }, { fields: ["userId"] }],
  }
);

Conversation.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: true,
  },
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

module.exports = Conversation;
