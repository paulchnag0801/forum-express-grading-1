'use strict'
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Comments',
      Array.from({ length: 10 }).map((d, i) => ({
        id: i * 10 + 1,
        text: faker.lorem.words(),
        userId: Math.floor(Math.random() * 3) + 1,
        restaurantId: Math.floor(Math.random() * 6) * 10 + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null, {})
  },
}
