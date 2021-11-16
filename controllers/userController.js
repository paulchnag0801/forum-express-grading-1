const bcrypt = require('bcryptjs')
const db = require('../models')
const { Op } = require('sequelize') //載入sequelize Operators
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then((user) => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(10),
              null
            ),
          }).then((user) => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  //取得個人Profile
  getUser: (req, res) => {
    const userId = req.params.id
    return Comment.findAll({
      raw: true,
      nest: true,
      where: { userId: userId },
      include: [Restaurant],
    })
      .then((comments) => {
        return User.findByPk(userId).then((user) => {
          // user.comments ? (user.commentCount = user.comments.length) : ''
          res.render('profile', { user: user.toJSON(), comments })
        })
      })
      .catch((err) => console.log(err))
  },
  editUser: (req, res) => {
    //只有自己能編輯自己的資料
    //防止使用網址修改id切換使用者去修改別人的Profile
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      req.flash('error_messages', '無法變更其他使用者的Profile')
      res.redirect(`/users/${helpers.getUser(req).id}`)
    }
    return User.findByPk(req.params.id).then((user) =>
      res.render('edit', { user: user.toJSON() })
    )
  },
  putUser: (req, res) => {
    User.findOne({
      where: { email: req.body.email, [Op.not]: { id: req.params.id } },
    }).then((emailCheck) => {
      if (emailCheck) {
        req.flash('error_messages', '此email已註冊過')
        res.redirect('back')
      }
    })

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id).then((user) => {
          user
            .update({
              name: req.body.name,
              email: req.body.email,
              image: file ? img.data.link : null,
            })
            .then(() => {
              req.flash('success_messages', '使用者資料編輯成功')
              return res.redirect(`/users/${req.params.id}`)
            })
        })
      })
    } else {
      return User.findByPk(req.params.id).then((user) => {
        user
          .update({
            name: req.body.name,
            email: req.body.email,
            image: user.image,
          })
          .then(() => {
            req.flash('success_messages', '使用者資料編輯成功')
            return res.redirect(`/users/${req.params.id}`)
          })
      })
    }
  },
}
module.exports = userController
