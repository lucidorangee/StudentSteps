const { Router } = require('express');
const controller = require('../controllers/roleController.js');

const roleRouter = Router();
roleRouter.get("/", controller.getRoles);
roleRouter.get("/:name", controller.getRoleByName);
roleRouter.post("/", controller.addRole);
roleRouter.delete("/:id", controller.removeRole);
roleRouter.put("/", controller.updateRole);

module.exports = roleRouter;