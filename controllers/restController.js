const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const pageLimit = 10 //指定一頁有 10 筆資料，將變數宣告在最上方，避免「magic number」


const restController = {
  //顯示所有餐廳頁面
  getRestaurants: (req, res) => {
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
    Restaurant.findAndCountAll({
      include: Category,
      where: whereQuery,
      offset: offset,
      limit: pageLimit,
    }).then((result) => {
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
      }))
      Category.findAll({
        raw: true,
        nest: true,
      }).then((categories) => {
        return res.render('restaurants', {
          restaurants: data,
          categories: categories,
          categoryId: categoryId,
          page: page,
          totalPage: totalPage,
          prev: prev,
          next: next,
        })
      })
    })
  },
  //顯示單一頁面
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
    }).then((restaurant) => {
      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
      })
    })
  },
}
module.exports = restController
