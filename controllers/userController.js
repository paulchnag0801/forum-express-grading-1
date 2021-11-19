const bcrypt = require('bcryptjs')
const db = require('../models')
const { Op } = require('sequelize') //載入sequelize Operators
const User = db.User
const Comment = db.Comment
const Favorite = db.Favorite
const Restaurant = db.Restaurant
const Like = db.Like
const Followship = db.Followship
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const restaurant = require('../models/restaurant')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

// 設定避免拿到使用者評論重複的餐廳
const removeRepeatComment = (resComments) => {
  const comments = []
  for (let resComment of resComments) {
    const check = comments.find(
      (comment) => comment.RestaurantId === resComment.RestaurantId
    )
    if (!check) {
      comments.push(resComment)
    }
  }
  return comments
}

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
    return User.findByPk(userId, {
      include: [
        {
          model: Comment,
          include: { model: Restaurant, attributes: ['id', 'image'] },
        },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        { model: Restaurant, as: 'FavoritedRestaurants' },
      ],
    })
      .then((user) => {
        user = user.toJSON()
        user.Comments
          ? (user.Comments = removeRepeatComment(user.Comments))
          : ''
        return res.render('profile', { user: user })
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
    
    //只有自己能編輯自己的資料
    //防止使用網址修改id切換使用者去修改別人的Profile
    if (helpers.getUser(req).id !== Number(req.params.id)) {
      req.flash('error_messages', '無法變更其他使用者的Profile')
      res.redirect(`/users/${helpers.getUser(req).id}`)
    }

    User.findOne({
      where: { email: req.body.email, [Op.not]: { id: req.params.id } },
    }).then((emailCheck) => {
      if (JSON.stringify(emailCheck) !== '{}') {
        req.flash('error_messages', '此email已註冊過')
        res.redirect('back')
      } else {
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
      }
    })
  },
  //收藏功能
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId,
    }).then((favorite) => {
      Restaurant.findByPk(req.params.restaurantId).then((restaurant) => {
        restaurant.increment('favoriteCounts')
      })
      return res.redirect('back')
    })
  },

  removeFavorite: (req, res) => {
    return Favorite.destroy({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId,
      },
    }).then((favorite) => {
      Restaurant.findByPk(req.params.restaurantId).then((restaurant) => {
        restaurant.decrement('favoriteCounts')
      })
      return res.redirect('back')
    })
  },
  //Like & Unlike
  addLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId,
    }).then((restaurant) => {
      return res.redirect('back')
    })
  },

  removeLike: (req, res) => {
    return Like.destroy({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId,
      },
    }).then((restaurant) => {
      return res.redirect('back')
    })
  },

  //追蹤 ＆ 被追蹤 TOP
  getTopUser: (req, res) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [{ model: User, as: 'Followers' }],
    }).then((users) => {
      // 整理 users 資料
      users = users.map((user) => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map((d) => d.id).includes(user.id),
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users: users })
    })
  },
  //新增追蹤
  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId,
    }).then((followship) => {
      return res.redirect('back')
    })
  },
  //移除追蹤
  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId,
      },
    }).then((followship) => {
      followship.destroy().then((followship) => {
        return res.redirect('back')
      })
    })
  },
}
module.exports = userController
