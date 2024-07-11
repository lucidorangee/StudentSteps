const { Router } = require('express');
const controller = require('../controllers/assessmentController.js')

const router = Router();

router.get("/", controller.getAssessments);
router.get("/:id", controller.getAssessmentById);
router.post("/", controller.addAssessment);
router.delete("/:id", controller.removeAssessment);

module.exports = router;