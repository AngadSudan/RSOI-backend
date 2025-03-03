import { Router } from 'express';
import {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
} from '../controllers/announcement.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
const announcementRouter = Router();

announcementRouter.get('/get-announcements', getAnnouncements);
announcementRouter.post('/create-announcement', verifyJWT, createAnnouncement);
announcementRouter.patch('/update/:id', verifyJWT, updateAnnouncement);
announcementRouter.delete('/delete/:id', verifyJWT, deleteAnnouncement);

export default announcementRouter;
