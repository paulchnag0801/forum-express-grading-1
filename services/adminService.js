// 這個檔案和controller/adminController.js以及api/adminController.js 有對應關係，需要把 adminController 的內容都抽取到 adminService.js

const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
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
  postRestaurant: async (req, res, callback) => {
    try {
      if (!req.body.name) {
        return callback({ status: 'error', message: "name didn't exist" })
      }
      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(file.path, async (err, img) => {
          await Restaurant.create({
            ...req.body,
            image: file ? img.data.link : null,
            CategoryId: req.body.categoryId,
          })
          callback({
            status: 'success',
            message: 'restaurant was successfully created',
          })
        })
      } else {
        await Restaurant.create({
          ...req.body,
          image: null,
          CategoryId: req.body.categoryId,
        })
        callback({
          status: 'success',
          message: 'restaurant was successfully created',
        })
      }
    } catch (erro) {
      console.log(erro)
    }
  },
  putRestaurant: async (req, res, callback) => {
    try {
      if (!req.body.name) {
       return callback({ status: 'error', message: "name didn't exist" })
      }

      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(file.path, async (err, img) => {
          const restaurant = await Restaurant.findByPk(req.params.id)
          await restaurant.update({
            ...req.body,
            image: file ? img.data.link : restaurant.image,
            CategoryId: req.body.categoryId,
          })
          callback({
            status: 'success',
            message: 'restaurant was successfully updated',
          })
        })
      } else {
        const restaurant = await Restaurant.findByPk(req.params.id)
        await restaurant.update({
          ...req.body,
          image: restaurant.image,
          CategoryId: req.body.categoryId,
        })
        callback({
          status: 'success',
          message: 'restaurant was successfully updated',
        })
      }
    } catch (error) {
      console.log(error)
    }
  },
  deleteRestaurant: async (req, res, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)
      await restaurant.destroy()
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
  getUsers: async (req, res, callback) => {
    try {
      const users = await User.findAll({ raw: true, nest: true })
      callback({ users })
    } catch (error) {
      console.log(error)
    }
  },
  toggleAdmin: async (req, res, callback) => {
    try {
      const user = await User.findByPk(req.params.id)
      if (user.email === 'root@example.com') {
        return callback({ status: 'error', message: '禁止變更管理者權限' })
      }
      const isAdmin = !user.isAdmin
      await user.update({ isAdmin })
      callback({ status: 'success', message: '使用者權限變更成功' })
    } catch (error) {
      console.log(error)
    }
  },
}
module.exports = adminService
