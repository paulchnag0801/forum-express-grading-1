//這裡是view的adminController
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const adminService = require('../services/adminService.js')


const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },
  createRestaurant: async (req, res) => {
    const categories = await Category.findAll({
      raw: true,
      nest: true,
    })
    return res.render('admin/create', {
      categories,
    })
  },
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },
  editRestaurant: async (req, res) => {
    const categories = await Category.findAll({
      raw: true,
      nest: true,
    })
    const restaurant = (await Restaurant.findByPk(req.params.id)).toJSON()
    return res.render('admin/create', {
      categories,
      restaurant,
    })
  },
  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },
  getUsers: (req, res) => {
    adminService.getUsers(req, res, (data) => {
      return res.render('admin/users', data)
    })
  },
  toggleAdmin: (req, res) => {
    adminService.toggleAdmin(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      return res.redirect('/admin/users')
    })
  },
}

module.exports = adminController
