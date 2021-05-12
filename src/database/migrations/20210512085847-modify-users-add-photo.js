module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          'Users',
          'photo',
          {
            type: Sequelize.TEXT,
            allowNull: true
          },
          { transaction }
        )
      ])
    })
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn('Users', 'photo', { transaction })
      ])
    })
  }
}
