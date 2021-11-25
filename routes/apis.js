const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const router = express.Router()
const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')



// admin routes setting
router.get('/admin/restaurants', adminController.getRestaurants)

router.get('/admin/restaurants/:id', adminController.getRestaurant)

router.post(
  '/admin/restaurants',
  upload.single('image'),
  adminController.postRestaurant
)

router.put(
  '/admin/restaurants/:id',
  upload.single('image'),
  adminController.putRestaurant
)

router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

// category routes setting
router.get('/admin/categories', categoryController.getCategories)
router.get('/admin/categories/:id', categoryController.getCategories)
router.post('/admin/categories', categoryController.postCategories)
router.put('/admin/categories/:id', categoryController.putCategory)

module.exports = router
