const db = require('../models')
const Comment = db.Comment

const commentService = {
  postComment: async (req, res, callback) => {
    try {
      const comment = await Comment.create({
        text: req.body.text,
        RestaurantId: req.body.restaurantId,
        UserId: req.user.id,
      })
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
  deleteComment: async (req, res, callback) => {
    try {
      const comment = await Comment.findByPk(req.params.id)
      await comment.destroy()
      callback({ status: 'success', message: '' })
    } catch (error) {
      console.log(error)
    }
  },
}

module.exports = commentService
