const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const router = express.Router()
const adminController = require('../controllers/api/adminController.js')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController.js')
const restController = require('../controllers/api/restController')
const commentController = require('../controllers/api/commentController')
const passport = require('../config/passport')
const authenticated = passport.authenticate('jwt', { session: false })




const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) {
      return next()
    }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

// admin restaurants routes setting
router.get(
  '/admin/restaurants',
  authenticated,
  authenticatedAdmin,
  adminController.getRestaurants
)

router.get(
  '/admin/restaurants/:id',
  authenticated,
  authenticatedAdmin,
  adminController.getRestaurant
)

router.post(
  '/admin/restaurants',
  authenticated,
  authenticatedAdmin,
  upload.single('image'),
  adminController.postRestaurant
)

router.put(
  '/admin/restaurants/:id',
  authenticated,
  authenticatedAdmin,
  upload.single('image'),
  adminController.putRestaurant
)

router.delete(
  '/admin/restaurants/:id',
  authenticated,
  authenticatedAdmin,
  adminController.deleteRestaurant
)

// admin users routes setting
router.get('/admin/users', authenticated, authenticatedAdmin, adminController.getUsers)
router.post('/admin/users/:id', authenticated, authenticatedAdmin, adminController.toggleAdmin)

// category routes setting
router.get(
  '/admin/categories',
  authenticated,
  authenticatedAdmin,
  categoryController.getCategories
)
router.get(
  '/admin/categories/:id',
  authenticated,
  authenticatedAdmin,
  categoryController.getCategories
)
router.post(
  '/admin/categories',
  authenticated,
  authenticatedAdmin,
  categoryController.postCategories
)
router.put(
  '/admin/categories/:id',
  authenticated,
  authenticatedAdmin,
  categoryController.putCategory
)
router.delete(
  '/admin/categories/:id',
  authenticated,
  authenticatedAdmin,
  categoryController.deleteCategory
)

// restaurant routes setting
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/top', authenticated, restController.getTopRestaurant)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashBoard)


// comment routes setting
router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticated, authenticatedAdmin, commentController.deleteComment) 

// user routes setting
router.get('/users/top', authenticated, userController.getTopUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)

// favorite routes setting
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)

// like routes setting
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

// following routes setting
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)

// JWT signin & signup
router.post('/signin', userController.signIn)
router.post('/signup', userController.signUp)

module.exports = router
