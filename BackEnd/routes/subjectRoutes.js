const { Router } = require('express');
const controller = require('../controllers/subjectController.js');

const roleRouter = Router();
roleRouter.get("/", controller.getSubjects);
roleRouter.post("/", controller.addSubject);
roleRouter.delete("/", controller.removeSubject);
roleRouter.put("/", controller.editSubject);

module.exports = roleRouter;