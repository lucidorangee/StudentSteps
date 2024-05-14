const { Router } = require('express');
const controller = require('../controllers/userController.js')
const passport = require("passport");

const router = Router();

router.post("/login", passport.authenticate("local"), controller.login, controller.loginfail);
router.post("/register", controller.registerUser);
router.get("/users", controller.checkAuthenticated, controller.getUsers);
router.post("/", controller.checkAuthenticated, controller.doNothing);

module.exports = router;
