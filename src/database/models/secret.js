const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Secret extends Model {
    static associate(models) {
      Secret.belongsTo(models.User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        foreignKey: 'user_id'
      })
    }
  }
  Secret.init(
    {
      user_id: DataTypes.INTEGER,
      public_code: DataTypes.TEXT,
      secret_type: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: 'Secret'
    }
  )
  return Secret
}
