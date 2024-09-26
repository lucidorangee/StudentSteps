const { Router } = require('express');
const controller = require('../controllers/tutoringSessionController.js')

const tutoringSessionRouter = Router();

tutoringSessionRouter.get("/", controller.getTutoringSessions);
tutoringSessionRouter.get("/:id", controller.getTutoringSessionById);
tutoringSessionRouter.post("/add", controller.addTutoringSession);
tutoringSessionRouter.delete("/:id", controller.removeTutoringSession);
tutoringSessionRouter.patch("/:id", controller.submitTutoringSession);

module.exports = tutoringSessionRouter;