const restService = require('../../services/restService')

const restController = {
  //顯示所有餐廳頁面
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, (data) => {
      return res.json(data)
    })
  },
  //顯示單一筆餐廳頁面
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },
  //最新動態
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, (data) => {
      return res.json(data)
    })
  },
  //瀏覽餐廳資訊平台
  getDashBoard: (req, res) => {
    restService.getDashBoard(req, res, (data) => {
      return res.json(data)
    })
  },
  //TOP10 Restaurants
  getTopRestaurant: (req, res) => {
    restService.getTopRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },
}

module.exports = restController