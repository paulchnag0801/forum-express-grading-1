const express = require('express')
const router = express.Router()
const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')



// admin routes setting
router.get('/admin/restaurants', adminController.getRestaurants)

router.get('/admin/restaurants/:id', adminController.getRestaurant)

router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

// category routes setting
router.get('/admin/categories', categoryController.getCategories)
router.get('/admin/categories/:id', categoryController.getCategories)

module.exports = router
