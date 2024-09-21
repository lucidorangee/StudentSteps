const { Router } = require('express');
const controller = require('../controllers/homeworkController.js')

const homeworkRouter = Router();

homeworkRouter.get("/", controller.getHomework);
homeworkRouter.get("/:id", controller.getHomeworkById);
homeworkRouter.post("/", controller.addHomework);
homeworkRouter.patch("/completion", controller.updateHomeworkCompletion);
homeworkRouter.delete("/:id", controller.removeHomework);
homeworkRouter.put("/:id", controller.updateHomework);

module.exports = homeworkRouter;