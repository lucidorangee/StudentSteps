const { Router } = require('express');
const controller = require('../controllers/tutorController.js')

const tutorRouter = Router();

tutorRouter.get("/", controller.getTutors);
tutorRouter.get("/:id", controller.getTutorById);
tutorRouter.post("/", controller.addTutor);
tutorRouter.delete("/:id", controller.removeTutor);
tutorRouter.put("/:id", controller.updateTutor);

module.exports = tutorRouter;