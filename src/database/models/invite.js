const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Invite extends Model {
    static associate(models) {
      Invite.belongsTo(models.User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        foreignKey: 'inviter_id'
      })
    }
  }
  Invite.init(
    {
      user_id: DataTypes.INTEGER,
      user_name: DataTypes.STRING,
      inviter_id: DataTypes.INTEGER,
      type: DataTypes.STRING,
      text: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'Invite'
    }
  )
  return Invite
}
