import { Router } from 'express';
import {
    createEvent,
    updateEvent,
    deleteEvent,
    getEventByMode,
    getEventByStatus,
    changeEventStatus,
} from '../controllers/Events.controllers.js';
const eventsRouter = Router();

eventsRouter.post('/create', createEvent);
eventsRouter.put('/update/:id', updateEvent);
eventsRouter.delete('/delete/:id', deleteEvent);
eventsRouter.get('/mode', getEventByMode);
eventsRouter.get('/status', getEventByStatus);
eventsRouter.put('/change-status/:id', changeEventStatus);

export default eventsRouter;
