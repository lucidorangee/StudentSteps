const { Router } = require('express');
const controller = require('../controllers/tutoringSessionDraftController.js')

const tutoringSessionDraftRouter = Router();

tutoringSessionDraftRouter.get("/", controller.getTutoringSessionDrafts);
tutoringSessionDraftRouter.post("/", controller.addTutoringSessionDraft);
tutoringSessionDraftRouter.delete("/:id", controller.removeTutoringSessionDraft);

module.exports = tutoringSessionDraftRouter;

/*

    getTutoringSessionDrafts,
    addTutoringSessionDraft,
    getTutoringSessionDraftById,
    removeTutoringSessionDraft,
    submitTutoringSessionDraft*/