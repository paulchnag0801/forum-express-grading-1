const express = require('express')
const router = express.Router()

const helpers = require('../_helpers')

const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const passport = require('../config/passport')

const authenticated = (req, res, next) => {
  // if(req.isAuthenticated)
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) {
      return next()
    }
    return next()
  }
  res.redirect('/signin')
}

const authenticatedAdmin = (req, res, next) => {
  // if(req.isAuthenticated)
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) {
      return next()
    }
    return res.redirect('/')
  }
  res.redirect('/signin')
}

//如果使用者訪問首頁，就導向 /restaurants 的頁面
router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))

//在 /restaurants 底下則交給 restController.getRestaurants 來處理
router.get('/restaurants', authenticated, restController.getRestaurants)

//顯示最新動態
router.get('/restaurants/feeds', authenticated, restController.getFeeds)

//TOP10人氣餐廳
router.get('/restaurants/top', authenticated, restController.getTopRestaurant)

//顯示單一餐廳路由
router.get('/restaurants/:id', authenticated, restController.getRestaurant)

//瀏覽單一餐廳資訊平台路由
router.get(
  '/restaurants/:id/dashboard',
  authenticated,
  restController.getDashBoard
)

//新增評論路由
router.post('/comments', authenticated, commentController.postComment)

//刪除評論路由
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)

// 連到 /admin 頁面就轉到 /admin/restaurants
router.get('/admin', authenticatedAdmin, (req, res) =>
  res.redirect('/admin/restaurants')
)

// 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
//READ-all
router.get(
  '/admin/restaurants',
  authenticatedAdmin,
  adminController.getRestaurants
)
//CREATE
router.get(
  '/admin/restaurants/create',
  authenticatedAdmin,
  adminController.createRestaurant
)

router.post(
  '/admin/restaurants',
  authenticatedAdmin,
  upload.single('image'),
  adminController.postRestaurant
)
//READ-one
router.get(
  '/admin/restaurants/:id',
  authenticatedAdmin,
  adminController.getRestaurant
)
//UPDATE
router.get(
  '/admin/restaurants/:id/edit',
  authenticatedAdmin,
  adminController.editRestaurant
)

router.put(
  '/admin/restaurants/:id',
  authenticatedAdmin,
  upload.single('image'),
  adminController.putRestaurant
)
//DELETE
router.delete(
  '/admin/restaurants/:id',
  authenticatedAdmin,
  adminController.deleteRestaurant
)
//登入＆登出＆註冊頁面路由
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true,
  }),
  userController.signIn
)
router.get('/logout', userController.logout)

// 管理者和使用者管理的切換路由
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
router.put(
  '/admin/users/:id/toggleAdmin',
  authenticatedAdmin,
  adminController.toggleAdmin
)

//後台分類的CRUD

// 後台分類的 Read
router.get(
  '/admin/categories',
  authenticatedAdmin,
  categoryController.getCategories
)

// 後台分類的 Create
router.post(
  '/admin/categories',
  authenticatedAdmin,
  categoryController.postCategory
)

//後台分類的 Update
router.get(
  '/admin/categories/:id',
  authenticatedAdmin,
  categoryController.getCategories
)

router.put(
  '/admin/categories/:id',
  authenticatedAdmin,
  categoryController.putCategory
)

//後來分類的 Delete
router.delete(
  '/admin/categories/:id',
  authenticatedAdmin,
  categoryController.deleteCategory
)

//追蹤 ＆ 被追蹤 TOP
router.get('/users/top', authenticated, userController.getTopUser)

//個人資訊
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put(
  '/users/:id',
  authenticated,
  upload.single('image'),
  userController.putUser
)

//收藏功能路由
//加入收藏
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)

//移除收藏
router.delete(
  '/favorite/:restaurantId',
  authenticated,
  userController.removeFavorite
)

//Like & Unlike
//Like
router.post('/like/:restaurantId', authenticated, userController.addLike)

//Unlike
router.delete('/like/:restaurantId', authenticated, userController.removeLike)

//follower & UnFollower
router.post('/following/:userId', authenticated, userController.addFollowing)

router.delete('/following/:userId', authenticated, userController.removeFollowing)

module.exports = router