import { Router } from 'express';
import {
    createEvent,
    updateEvent,
    deleteEvent,
    getEventByMode,
    getEventByStatus,
    changeEventStatus,
} from '../controllers/Events.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
const eventsRouter = Router();

eventsRouter.post(
    '/create',
    upload.single('imagePath'),
    verifyJWT,
    createEvent
);
eventsRouter.put(
    '/update/:id',
    upload.single('imagePath'),
    verifyJWT,
    updateEvent
);
eventsRouter.delete('/delete/:id', verifyJWT, deleteEvent);
eventsRouter.get('/mode', getEventByMode);
eventsRouter.get('/status', getEventByStatus);
eventsRouter.put('/change-status/:id', verifyJWT, changeEventStatus);

export default eventsRouter;
