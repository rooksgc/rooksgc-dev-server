module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          'Messages',
          'to',
          {
            type: Sequelize.INTEGER,
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
        queryInterface.removeColumn('Messages', 'to', { transaction })
      ])
    })
  }
}
