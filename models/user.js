'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Comment)
      User.belongsToMany(models.Restaurant, {
        //一個使用者同時可以收藏很多餐廳，所以從使用者出發去尋找這個使用者多少間餐廳。
        through: models.Favorite, //透過Favorite的models
        foreignKey: 'UserId', //找到使用者的id
        as: 'FavoritedRestaurants', //新增一個別名，將找到的餐廳放進去，同樣的透過類似 user.FavoritedRestaurants 這樣的方法來呼叫出和 user 實例有收藏關係的所有餐廳。
      })
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'User',
    }
  )
  return User
}
