const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

// setup passport strategy
passport.use(
  new LocalStrategy(
    // customize user field
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    // authenticate user
    (req, username, password, cb) => {
      User.findOne({ where: { email: username } }).then((user) => {
        if (!user)
          return cb(
            null,
            false,
            req.flash('error_messages', '帳號或密碼輸入錯誤')
          )
        if (!bcrypt.compareSync(password, user.password))
          return cb(
            null,
            false,
            req.flash('error_messages', '帳號或密碼輸入錯誤！')
          )
        return cb(null, user)
      })
    }
  )
)

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
//拿出所有使用者,順便拿出使用者所收藏過的餐廳。
passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [{ model: Restaurant, as: 'FavoritedRestaurants' }],
  }).then((user) => {
    user = user.toJSON()
    return cb(null, user)
  })
})

module.exports = passport
