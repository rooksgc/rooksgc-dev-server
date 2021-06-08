module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.addColumn(
          'Users',
          'contacts',
          {
            type: Sequelize.TEXT,
            allowNull: true
          },
          { transaction }
        ),
        queryInterface.addColumn(
          'Users',
          'channels',
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
        queryInterface.removeColumn('Users', 'contacts', { transaction }),
        queryInterface.removeColumn('Users', 'channels', { transaction })
      ])
    })
  }
}
