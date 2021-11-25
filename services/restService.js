const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const helpers = require('../_helpers')
const pageLimit = 10 //指定一頁有 10 筆資料，將變數宣告在最上方，避免「magic number」

const restService = {
  //顯示所有餐廳頁面
  getRestaurants: async (req, res, callback) => {
    try {
      let offset = 0 //偏移量，要從第幾個資料開始抓，這邊設0是第1筆開始。
      const whereQuery = {}
      let categoryId = ''
      if (req.query.page) {
        //考慮沒有 page 參數的情況
        offset = (req.query.page - 1) * pageLimit // 公式 : offset = (n-1) * limit
      }
      if (req.query.categoryId) {
        categoryId = Number(req.query.categoryId)
        whereQuery.categoryId = categoryId
      }
      const result = await Restaurant.findAndCountAll({
        include: Category,
        where: whereQuery,
        offset: offset,
        limit: pageLimit,
      })
      //將restaurant改成result，因為會拿到兩種資料，餐廳與總共有多少筆資料
      // data for pagination
      const page = Number(req.query.page) || 1 //現在在第幾頁？如果是剛進入頁面，就預設為1
      const pages = Math.ceil(result.count / pageLimit) //總共有多少頁，（總共有多少筆資料/每頁筆數），用 result.count 知道總共有幾筆餐廳，Math.ceil 無條件進位。
      const totalPage = Array.from({ length: pages }).map(
        //儲存所有頁數
        (item, index) => index + 1
      )
      const prev = page - 1 < 1 ? 1 : page - 1 //上一頁
      const next = page + 1 > pages ? pages : page + 1 //下一頁

      // clean up restaurant data
      const data = result.rows.map((r) => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map((d) => d.id).includes(
          r.id
        ),
        isLiked: req.user.LikedRestaurants.map((d) => d.id).includes(r.id),
      }))
      const categories = await Category.findAll({
        raw: true,
        nest: true,
      })
      callback({
        restaurants: data,
        categories: categories,
        categoryId: categoryId,
        page: page,
        totalPage: totalPage,
        prev: prev,
        next: next,
      })
    } catch (error) {
      console.log(error)
    }
  },
  getRestaurant: async (req, res, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [
          Category,
          { model: User, as: 'FavoritedUsers' }, // 把有收藏這間餐廳的使用者拿近來
          { model: User, as: 'LikedUsers' },
          // 把有like這間餐廳的使用者拿近來
          { model: Comment, include: [User] },
        ],
      })
      restaurant.increment('viewCounts')
      const isFavorited = restaurant.FavoritedUsers.map((d) => d.id).includes(
        req.user.id
      ) // 找出收藏此餐廳的 user
      const isLiked = restaurant.LikedUsers.map((d) => d.id).includes(
        req.user.id
      ) // 找出like此餐廳的 user
      callback({ restaurant: restaurant.toJSON(), isFavorited, isLiked })
    } catch (error) {
      console.log(error)
    }
  },
  getFeeds: async (req, res, callback) => {
    try {
      const result = await Promise.all([
        Restaurant.findAll({
          limit: 10,
          raw: true,
          nest: true,
          order: [['createdAt', 'DESC']],
          include: [Category],
        }),
        Comment.findAll({
          limit: 10,
          raw: true,
          nest: true,
          order: [['createdAt', 'DESC']],
          include: [User, Restaurant],
        }),
      ])
      callback({ restaurants: result[0], comments: result[1] })
    } catch (error) {
      console.log(error)
    }
  },
  getDashBoard: async (req, res, callback) => {
    try {
      const restaurant = (
        await Restaurant.findByPk(req.params.id, {
          include: [Comment, Category, { model: User, as: 'FavoritedUsers' }],
        })
      ).toJSON()
      callback({ restaurant })
    } catch (error) {
      console.log(error)
    }
  },
  getTopRestaurant: async (req, res, callback) => {
    try {
      let restaurants = await Restaurant.findAll({
        include: [{ model: User, as: 'FavoritedUsers' }],
      })
      restaurants = restaurants.map((r) => ({
        ...r.dataValues,
        description: r.description.substring(0, 50),
        favoritedCount: r.FavoritedUsers.length,
        isFavorite: helpers
          .getUser(req)
          .FavoritedRestaurants.map((d) => d.id)
          .includes(r.id),
      }))
      restaurants = restaurants
        .sort((a, b) => b.favoritedCount - a.favoritedCount)
        .slice(0, 10)

      callback({ restaurants })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = restService