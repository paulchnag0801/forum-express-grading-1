const restService = require('../services/restService')



const restController = {
  //顯示所有餐廳頁面
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, (data) => {
      return res.render('restaurants', data)
    })
  },

  //顯示單一頁面
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, (data) => {
      return res.render('restaurant', data)
    })
  },

  //最新動態
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, (data) => {
      return res.render('feeds', data)
    })
  },


  //瀏覽餐廳資訊平台
  getDashBoard: (req, res) => {
    restService.getDashBoard(req, res, (data) => {
      return res.render('dashboard', data)
    })
  },

  //TOP10 Restaurants
   getTopRestaurant: (req, res) => {
    restService.getTopRestaurant(req, res, data => {
      return res.render('topRestaurant', data)
    })
  },

}
module.exports = restController
