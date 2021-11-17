'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      // define association here
      Restaurant.belongsTo(models.Category) 
      Restaurant.hasMany(models.Comment)
      //加入多對多的關聯語法，從餐廳出發，去尋找一間餐廳會被哪些使用者收藏
      Restaurant.belongsToMany(models.User, {
        //belongsToMany 表示這是一個多對多關係
        through: models.Favorite, //透過through告訴Sequelize，應該從Favorite的models去找
        foreignKey: 'RestaurantId', //找出餐廳的id
        as: 'FavoritedUsers', //新增一個別名，將找到的user存進去。就可以用 restaurant.FavoritedUsers 來呼叫出和餐廳相關的 User 物件。
      })
    }
  }
  Restaurant.init(
    {
      name: DataTypes.STRING,
      tel: DataTypes.STRING,
      address: DataTypes.STRING,
      opening_hours: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
      CategoryId: DataTypes.INTEGER,
      viewCounts: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Restaurant',
    }
  )
  return Restaurant
}
