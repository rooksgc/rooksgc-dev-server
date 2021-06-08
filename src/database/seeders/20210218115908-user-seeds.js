module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          name: 'John',
          email: 'example@example.com',
          password: 'aY8djw9~aj',
          role: 'user',
          is_active: false,
          contacts: null,
          channels: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Pavel',
          email: 'pasha@gmail.com',
          password: 'j*h37h-d02',
          role: 'user',
          is_active: false,
          contacts: '[1,3]',
          channels: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'alex',
          email: 'alex@mail.ru',
          password: 'J0jhh&1!3f',
          role: 'user',
          is_active: false,
          contacts: '[1,2]',
          channels: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
}
