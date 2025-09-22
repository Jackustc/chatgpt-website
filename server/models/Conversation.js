const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const User = require("./User");

const Conversation = sequelize.define(
  "Conversation",
  {
    prompt: { type: DataTypes.TEXT, allowNull: false },
    response: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    timestamps: true,
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
