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
const eventsRouter = Router();

eventsRouter.post('/create', verifyJWT, createEvent);
eventsRouter.put('/update/:id', verifyJWT, updateEvent);
eventsRouter.delete('/delete/:id', verifyJWT, deleteEvent);
eventsRouter.get('/mode', verifyJWT, getEventByMode);
eventsRouter.get('/status', verifyJWT, getEventByStatus);
eventsRouter.put('/change-status/:id', verifyJWT, changeEventStatus);

export default eventsRouter;
