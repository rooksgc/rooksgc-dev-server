const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Channel extends Model {
    static associate(models) {
      Channel.belongsTo(models.User, {
        foreignKey: 'owner_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
      Channel.hasMany(models.Message, {
        foreignKey: 'channel_id',
        as: 'messages',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  Channel.init(
    {
      owner_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      members: DataTypes.STRING,
      photo: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'Channel'
    }
  )
  return Channel
}
