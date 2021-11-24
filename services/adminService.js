// 這個檔案和controller/adminController.js以及api/adminController.js 有對應關係，需要把 adminController 的內容都抽取到 adminService.js

const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  getRestaurants: async (req, res, callback) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        include: [Category],
      })
      callback({ restaurants: restaurants })
    } catch (erro) {
      console.log(erro)
    }
  },
  getRestaurant: async (req, res, callback) => {
    try {
      const restaurant = (
        await Restaurant.findByPk(req.params.id, {
          include: [Category],
        })
      ).toJSON()
      callback({ restaurant: restaurant })
    } catch (erro) {
      console.log(erro)
    }
  },
}
module.exports = adminService
