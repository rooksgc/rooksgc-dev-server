const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Channel, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        foreignKey: 'channel_id'
      })
    }
  }
  Message.init(
    {
      user_id: DataTypes.INTEGER,
      channel_id: DataTypes.INTEGER,
      to: DataTypes.INTEGER,
      type: DataTypes.STRING,
      text: DataTypes.STRING,
      photo: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Message'
    }
  )
  return Message
}
