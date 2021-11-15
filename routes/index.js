const helpers = require('../_helpers')

const restController = require('../controllers/restController.js')
const adminController = require('../controllers/adminController.js')
const userController = require('../controllers/userController.js')
const categoryController = require('../controllers/categoryController.js')
const commentController = require('../controllers/commentController.js')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
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
  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))

  //在 /restaurants 底下則交給 restController.getRestaurants 來處理
  app.get('/restaurants', authenticated, restController.getRestaurants)

  //顯示單一餐廳路由
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)

  //新增評論路由
  app.post('/comments', authenticated, commentController.postComment)

  //刪除評論路由
  app.delete(
    '/comments/:id',
    authenticatedAdmin,
    commentController.deleteComment
  )

  // 連到 /admin 頁面就轉到 /admin/restaurants
  app.get('/admin', authenticatedAdmin, (req, res) =>
    res.redirect('/admin/restaurants')
  )

  // 在 /admin/restaurants 底下則交給 adminController.getRestaurants 處理
  //READ-all
  app.get(
    '/admin/restaurants',
    authenticatedAdmin,
    adminController.getRestaurants
  )
  //CREATE
  app.get(
    '/admin/restaurants/create',
    authenticatedAdmin,
    adminController.createRestaurant
  )

  app.post(
    '/admin/restaurants',
    authenticatedAdmin,
    upload.single('image'),
    adminController.postRestaurant
  )
  //READ-one
  app.get(
    '/admin/restaurants/:id',
    authenticatedAdmin,
    adminController.getRestaurant
  )
  //UPDATE
  app.get(
    '/admin/restaurants/:id/edit',
    authenticatedAdmin,
    adminController.editRestaurant
  )

  app.put(
    '/admin/restaurants/:id',
    authenticatedAdmin,
    upload.single('image'),
    adminController.putRestaurant
  )
  //DELETE
  app.delete(
    '/admin/restaurants/:id',
    authenticatedAdmin,
    adminController.deleteRestaurant
  )
  //登入＆登出＆註冊頁面路由
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  app.get('/signin', userController.signInPage)
  app.post(
    '/signin',
    passport.authenticate('local', {
      failureRedirect: '/signin',
      failureFlash: true,
    }),
    userController.signIn
  )
  app.get('/logout', userController.logout)

  // 管理者和使用者管理的切換路由
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.put(
    '/admin/users/:id/toggleAdmin',
    authenticatedAdmin,
    adminController.toggleAdmin
  )

  //後台分類的CRUD

  // 後台分類的 Read
  app.get(
    '/admin/categories',
    authenticatedAdmin,
    categoryController.getCategories
  )

  // 後台分類的 Create
  app.post(
    '/admin/categories',
    authenticatedAdmin,
    categoryController.postCategory
  )

  //後台分類的 Update
  app.get(
    '/admin/categories/:id',
    authenticatedAdmin,
    categoryController.getCategories
  )

  app.put(
    '/admin/categories/:id',
    authenticatedAdmin,
    categoryController.putCategory
  )

  //後來分類的 Delete
  app.delete(
    '/admin/categories/:id',
    authenticatedAdmin,
    categoryController.deleteCategory
  )
}
