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
      User.belongsToMany(models.Restaurant, {
        through: models.Like,
        foreignKey: 'UserId',
        as: 'LikedRestaurants',
      })
      User.belongsToMany(User, {
        //一個使用者可以被很多使用者追蹤，所以從user自己出發，去尋找有多少人追蹤自己。
        through: models.Followship, //透過 Followship model 來查資料。
        foreignKey: 'followingId', //followingId 被追蹤者的id
        as: 'Followers', //新增一個別名，將找到的追蹤者的id，放進Followers的裡面
      })
      User.belongsToMany(User, {
        //一個使用者可以追蹤很多個使用者，一樣從user自己出發，但使用自己的id去尋找你追蹤了多少人。
        through: models.Followship, //透過 Followship Model
        foreignKey: 'followerId', //followerId 追蹤者的id
        as: 'Followings', //將你追蹤的所有人的id，放進Followings。
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
