const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Secret, {
        foreignKey: 'user_id',
        as: 'secrets',
        onDelete: 'CASCADE'
      })
      User.hasMany(models.Message, {
        foreignKey: 'user_id',
        as: 'messages',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
      contacts: DataTypes.STRING,
      channels: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'User'
    }
  )
  return User
}
