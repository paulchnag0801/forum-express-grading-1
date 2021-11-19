'use strict'
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          id: 1,
          email: 'root@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: true,
          name: 'admin',
          image: `https://loremflickr.com/320/320/?random=${
            Math.random() * 100
          }`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: 'user1@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: false,
          name: 'user1',
          image: `https://loremflickr.com/320/320/?random=${
            Math.random() * 100
          }`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          email: 'user2@example.com',
          password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
          isAdmin: false,
          name: 'user2',
          image: `https://loremflickr.com/320/320/?random=${
            Math.random() * 100
          }`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          email: 'x1232178987@gmail.com',
          password: bcrypt.hashSync('1', bcrypt.genSaltSync(10), null),
          isAdmin: true,
          name: 'PAUL',
          image: `https://loremflickr.com/320/320/?random=${
            Math.random() * 100
          }`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  },
}
