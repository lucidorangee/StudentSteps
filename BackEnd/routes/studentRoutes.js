const { Router } = require('express');
const controller = require('../controllers/studentController.js')

const studentRouter = Router();

studentRouter.get("/", controller.getStudents);
studentRouter.get("/:id", controller.getStudentById);
studentRouter.post("/", controller.addStudent);
studentRouter.delete("/:id", controller.removeStudent);
studentRouter.get("/download/:id", controller.downloadStudent);
studentRouter.put("/:id", controller.updateStudent);

module.exports = studentRouter;