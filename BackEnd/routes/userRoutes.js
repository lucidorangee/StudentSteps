const { Router } = require('express');
const controller = require('../controllers/userController.js')
const passport = require("passport");

const router = Router();

router.post("/login", passport.authenticate("local"), controller.login, controller.loginfail);
router.post("/logout", controller.logout);
router.post("/register", controller.registerUser);
router.get("/users", controller.getUsers);
router.get("/", controller.checkAuthenticated);
router.delete("/users/:id", controller.deleteUser);

module.exports = router;
