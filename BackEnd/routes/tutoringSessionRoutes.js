const { Router } = require('express');
const controller = require('../controllers/tutoringSessionController.js')

const tutoringSessionRouter = Router();

tutoringSessionRouter.get("/", controller.getTutoringSessions);
tutoringSessionRouter.get("/:id", controller.getTutoringSessionById);
tutoringSessionRouter.post("/add", controller.addTutoringSession);
tutoringSessionRouter.delete("/remove", controller.removeTutoringSessionBulk);
tutoringSessionRouter.delete("/:id", controller.removeTutoringSession);
tutoringSessionRouter.put("/:id", controller.submitTutoringSession);
tutoringSessionRouter.patch("/:id", controller.editTutoringSession);


module.exports = tutoringSessionRouter;