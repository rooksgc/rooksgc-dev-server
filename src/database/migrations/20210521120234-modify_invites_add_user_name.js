module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          'Invites',
          'user_name',
          {
            type: Sequelize.STRING,
            allowNull: false
          },
          { transaction }
        )
      ])
    })
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.removeColumn('Invites', 'user_name', { transaction })
      ])
    })
  }
}
