const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: async (req, res, callback) => {
    try {
      const categories = await Category.findAll({
        raw: true,
        nest: true,
      })
      if (req.params.id) {
        const category = (await Category.findByPk(req.params.id)).toJSON()
        callback({ categories, category })
      } else {
        callback({ categories })
      }
    } catch (error) {
      console.log(error)
    }
  },
  postCategories: async (req, res, callback) => {
    try {
      if (!req.body.name) {
        callback({ status: 'error', messages: "name didn't exist" })
      } else {
        await Category.create({ name: req.body.name })
        callback({ status: 'success', message: '' })
      }
    } catch (error) {
      console.log(error)
    }
  },
  putCategory: async (req, res, callback) => {
    try {
      if (!req.body.name) {
        callback({ status: 'error', message: '未輸入分類名稱' })
      } else {
        await Category.update(
          { name: req.body.name },
          { where: { id: req.params.id } }
        )
        callback({ status: 'success', message: '' })
      }
    } catch (error) {
      console.log(error)
    }
  },
  deleteCategory: async (req, res, callback) => {
    try {
      await Category.destroy({ where: { id: req.params.id } })
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = categoryService
