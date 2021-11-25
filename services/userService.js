const bcrypt = require('bcryptjs')
const { Op } = require('sequelize') //載入sequelize Operators
const {
  Comment,
  Favorite,
  Followship,
  Like,
  Restaurant,
  User,
} = require('../models')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
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

const userService = {
  //註冊
  signUp: async (req, res, callback) => {
    try {
      // confirm password
      if (req.body.passwordCheck !== req.body.password) {
        req.flash('error_messages', '兩次密碼輸入不同！')
        return res.redirect('/signup')
      } else {
        // confirm unique user
        const user = await User.findOne({ where: { email: req.body.email } })
        if (user) {
          return callback({ status: 'error', message: '此信箱已註冊過！' })
        } else {
          await User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(10),
              null
            ),
          })
          callback({ status: 'success', message: '成功註冊帳號！' })
        }
      }
    } catch (error) {
      console.log(error)
    }
  },
  getUser: async (req, res, callback) => {
    try {
      const user = (
        await User.findByPk(req.params.id, {
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
      ).toJSON()
      user.Comments ? (user.Comments = removeRepeatComment(user.Comments)) : ''
      callback({ user })
    } catch (error) {
      console.log(error)
    }
  },
  putUser: async (req, res, callback) => {
    try {
      //只有自己能編輯自己的資料
      //防止使用網址修改id切換使用者去修改別人的Profile
      if (helpers.getUser(req).id !== Number(req.params.id)) {
        req.flash('error_messages', '無法變更其他使用者的Profile')
        res.redirect(`/users/${helpers.getUser(req).id}`)
      }
      if (helpers.getUser(req).email !== req.body.email) {
        const emailCheck = await User.findOne({
          where: { email: req.body.email },
        })
        if (JSON.stringify(emailCheck) !== '{}') {
          return callback({ status: 'error', message: '此email已註冊過' })
        }
      }

      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(file.path, async (err, img) => {
          const user = await User.findByPk(req.params.id)
          await user.update({
            ...req.body,
            image: file ? img.data.link : helpers.getUser(req).image,
          })
          callback({ status: 'success', message: '使用者資料編輯成功' })
        })
      } else {
        const user = await User.findByPk(req.params.id)
        await user.update({
          ...req.body,
          image: helpers.getUser(req).image,
        })
        callback({ status: 'success', message: '使用者資料編輯成功' })
      }
    } catch (err) {
      console.log(err)
    }
  },
  addFavorite: async (req, res, callback) => {
    try {
      const favorite = await Favorite.create({
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId,
      })
      const restaurant = await Restaurant.findByPk(req.params.restaurantId)
      restaurant.increment('favoriteCounts')
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
  removeFavorite: async (req, res, callback) => {
    try {
      const favorite = await Favorite.destroy({
        where: {
          UserId: req.user.id,
          RestaurantId: req.params.restaurantId,
        },
      })
      const restaurant = await Restaurant.findByPk(req.params.restaurantId)
      restaurant.decrement('favoriteCounts')
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
  addLike: async (req, res, callback) => {
    try {
      const restaurant = await Like.create({
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId,
      })
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
  removeLike: async (req, res, callback) => {
    try {
      const restaurant = await Like.destroy({
        where: {
          UserId: helpers.getUser(req).id,
          RestaurantId: req.params.restaurantId,
        },
      })
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
  getTopUser: async (req, res, callback) => {
    try {
      let users = await User.findAll({
        include: [{ model: User, as: 'Followers' }],
      })
      // 整理 users 資料
      users = users.map((user) => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: helpers
          .getUser(req)
          .Followings.filter((follower) => follower.id === user.id),
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      callback({ users })
    } catch (error) {
      console.log(error)
    }
  },
  addFollowing: async (req, res, callback) => {
    try {
      const followship = await Followship.create({
        followerId: req.user.id,
        followingId: req.params.userId,
      })
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },

  removeFollowing: async (req, res, callback) => {
    try {
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId,
        },
      })
      await followship.destroy()
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = userService
