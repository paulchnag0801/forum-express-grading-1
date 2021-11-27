const db = require('../models')
const User = db.User
const helpers = require('../_helpers')
const userService = require('../services/userService')

const userController = {
  // 渲染註冊頁面
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  //註冊
  signUp: (req, res) => {
    userService.signUp(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('/signup')
      }
      req.flash('success_messages', data.message)
      return res.redirect('/signin')
    })
  },

  // 渲染登入頁面
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
    userService.getUser(req, res, (data) => {
      return res.render('profile', data)
    })
  },

  editUser: async (req, res) => {
    try {
      //只有自己能編輯自己的資料
      //防止使用網址修改id切換使用者去修改別人的Profile
      if (helpers.getUser(req).id !== Number(req.params.id)) {
        req.flash('error_messages', '無法變更其他使用者的Profile')
        res.redirect(`/users/${helpers.getUser(req).id}`)
      }
      const user = (await User.findByPk(req.params.id)).toJSON()
      return res.render('edit', { user })
    } catch (error) {
      console.log(error)
    }
  },

  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      res.redirect(`/users/${helpers.getUser(req).id}`)
    })
  },

  //收藏功能
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },

  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },

  //Like & Unlike
  addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },
  removeLike: (req, res) => {
    userService.removeLike(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },

  //追蹤 ＆ 被追蹤 TOP
  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.render('topUser', data)
    })
  },

  //新增追蹤
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },

  //移除追蹤
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('back')
      }
    })
  },
}
module.exports = userController
