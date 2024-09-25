const { Router } = require('express');
const controller = require('../controllers/commentController.js')

const commentRouter = Router();

commentRouter.get("/", controller.getComments);
commentRouter.get("/:id", controller.getCommentById);
commentRouter.post("/", controller.addComment);
commentRouter.post("/:id", controller.completeAndAddComment);

commentRouter.delete("/", controller.removeCommentByCondition);
commentRouter.delete("/:id", controller.removeComment);

module.exports = commentRouter;