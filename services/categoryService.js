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
    } catch (erro) {
      console.log(erro)
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
      console.log(erro)
    }
  },
}

module.exports = categoryService
