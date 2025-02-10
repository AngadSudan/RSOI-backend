import { uploadMedia, deleteMedia } from '../utils/Cloudinary.js';
import User from '../models/user.models.js';
import Event from '../models/event.models.js';
import mongoose from 'mongoose';
import { ApiError, ApiResponse } from '../utils/index.js';
const createEvent = async (req, res) => {
    const { name, description, timeline, mode, location, eventLink } = req.body;
    const user = req.user._id;

    const imagePath = req.file.path;
    if (!user) {
        return res.status(400).json(new ApiError(400, 'User is required'));
    }
    if (!name) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    'An event without a name cannot be registered'
                )
            );
    }
    if (!description || description.length < 50) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    'An event without a description cannot be registered and the descrption should be atleast 50 characters long'
                )
            );
    }

    if (!timeline) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    'An event without a timeline cannot be registered'
                )
            );
    }
    if (!mode) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    'Please specify whether the event is online, offline or hybrid'
                )
            );
    }
    if (!location && mode === 'offline') {
        return res
            .status(400)
            .json(
                new ApiError(400, 'Please specify the location of the event')
            );
    }
    if (!eventLink && mode === 'online') {
        return res
            .status(400)
            .json(new ApiError(400, 'Please specify the event link'));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const dbUser = await User.findById(user)
            .select('-refreshToken -password')
            .session(session);
        if (!dbUser)
            return res
                .status(400)
                .json(
                    new ApiError(400, 'User Token not found, please relogin')
                );
        //authorize user

        if (dbUser.role !== 'eventAdmin' || dbUser.role !== 'superAdmin') {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'You are not authorized to create an event'
                    )
                );
        }
        let imageLink = '';
        //cloudinary upload
        if (imagePath) {
            const result = await uploadMedia(imagePath);

            if (!result) {
                return res
                    .status(400)
                    .json(new ApiError(400, 'Error uploading image'));
            }
            imageLink = result.secure_url;
        }
        //check if the event already exists

        const eventExists = await Event.findOne({ name }).session(session);
        if (eventExists) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'An event with the same name already exists, try upating the details'
                    )
                );
        }

        const createdEvent = await Event.create(
            {
                name,
                description,
                timeline,
                location,
                mode,
                eventLink,
                imageLink,
            },
            { session: session }
        );

        if (!createdEvent) {
            return res
                .status(400)
                .json(new ApiError(400, 'Error creating event'));
        }

        await session.commitTransaction();
        session.endSession();
        return res
            .status(201)
            .json(
                new ApiResponse(201, 'Event created successfully', createdEvent)
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log('event');
        return res
            .status(500)
            .json(
                new ApiError(500, 'error in creating an event', [error.message])
            );
    }
};
const updateEvent = async (req, res) => {
    const { id: event } = req.params;
    const {
        name,
        description,
        status,
        timeline,
        mode,
        location,
        eventLink,
        isPublic,
    } = req.body;
    const user = req.user._id;

    const imagePath = req.file.path;
    if (!user) {
        return res.status(400).json(new ApiError(400, 'User is required'));
    }
    if (!event) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    'Please provide the event id to update the event'
                )
            );
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const dbUser = await User.findById(user)
            .select('-refreshToken -password')
            .session(session);
        if (!dbUser)
            return res
                .status(400)
                .json(
                    new ApiError(400, 'User Token not found, please relogin')
                );
        //authorize user

        if (dbUser.role !== 'eventAdmin' || dbUser.role !== 'superAdmin') {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'You are not authorized to create an event'
                    )
                );
        }

        //check if the event already exists
        const eventExists = await Event.findById(event).session(session);

        if (!eventExists) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'No such event avaliable or the event was deleted'
                    )
                );
        }

        let imageLink = eventExists.imageLink;

        //cloudinary upload
        if (imagePath) {
            //delete the previoud link from the database
            const deletedUrl = await deleteMedia(imageLink);
            if (!deletedUrl) {
                return res
                    .status(400)
                    .json(
                        new ApiError(
                            400,
                            'Error deleting the previous image link'
                        )
                    );
            }
            const result = await uploadMedia(imagePath);

            if (!result) {
                return res
                    .status(400)
                    .json(new ApiError(400, 'Error uploading image'));
            }
            imageLink = result.secure_url;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventExists._id,
            {
                name,
                description,
                timeline,
                location,
                mode,
                status,
                eventLink,
                imageLink,
                isPublic,
            },
            { new: true, session: session }
        );

        if (!updatedEvent) {
            return res
                .status(400)
                .json(new ApiError(400, 'Error creating event'));
        }

        await session.commitTransaction();
        session.endSession();
        return res
            .status(201)
            .json(
                new ApiResponse(201, 'Event created successfully', updatedEvent)
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log('event');
        return res
            .status(500)
            .json(
                new ApiError(500, 'error in updating an event', [error.message])
            );
    }
};
const deleteEvent = async (req, res) => {
    const { id: event } = req.params;
    const user = req.user._id;

    if (!user) {
        return res.status(400).json(new ApiError(400, 'User is required'));
    }
    if (!event) {
        return res
            .status(400)
            .json(
                new ApiError(
                    400,
                    'Please provide the event id to delete the event'
                )
            );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const dbUser = await User.findById(user)
            .select('-refreshToken -password')
            .session(session);
        if (!dbUser)
            return res
                .status(400)
                .json(
                    new ApiError(400, 'User Token not found, please relogin')
                );
        //authorize user

        if (dbUser.role !== 'eventAdmin' || dbUser.role !== 'superAdmin') {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'You are not authorized to create an event'
                    )
                );
        }

        //check if the event already exists
        const eventExists = await Event.findById(event).session(session);

        if (!eventExists) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'No such event avaliable or the event was deleted'
                    )
                );
        }

        const deletedEvent = await Event.findByIdAndUpdate(
            eventExists._id,
            {
                isPublic: false,
            },
            { session, new: true }
        );

        if (!deleteEvent) {
            return res
                .status(400)
                .json(new ApiError(400, 'Error deleting event'));
        }

        await session.commitTransaction();
        session.endSession();

        return res
            .status(201)
            .json(
                new ApiResponse(201, 'Event deleted successfully', deletedEvent)
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'error in deleting an event', [error.message])
            );
    }
};
const getEventByMode = async (req, res) => {
    const session = await mongoose.startSession();
    const { mode } = req.body;
    session.startTransaction();

    if (!mode) {
        mode = ['online', 'offline', 'hybrid'];
    }
    try {
        const dbEvents = await Event.find({
            mode: {
                $in: [...mode],
            },
        }).session(session);

        if (!dbEvents) {
            return res
                .status(400)
                .json(new ApiError(400, 'No event in these modes found'));
        }

        await session.commitTransaction();
        session.endSession();
        return res
            .status(200)
            .json(new ApiResponse(200, 'Offline events found', dbEvents));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'Error in fetching events', [error.message])
            );
    }
};
const getEventByStatus = async (req, res) => {
    const { status } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    if (!status) {
        status = ['upcoming', 'ongoing', 'past'];
    }
    try {
        const dbEvents = await Event.find({
            status: {
                $in: [...status],
            },
        }).session(session);

        if (!dbEvents) {
            return res.status(400).json(new ApiError(400, 'No events found'));
        }

        await session.commitTransaction();
        session.endSession();
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    ' events found with the following status found',
                    dbEvents
                )
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'Error in fetching events', [error.message])
            );
    }
};
const changeEventStatus = async (req, res) => {
    const { id: event } = req.params;
    const user = req.user._id;
    const { status } = req.body;
    if (!user) {
        return res.status(400).json(new ApiError(400, 'User is required'));
    }
    if (!status) {
        return res.status(400).json(new ApiError(400, 'Status is required'));
    }
    if (!event) {
        return res.status(400).json(new ApiError(400, 'Event is required'));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const dbUser = await User.findById(user)
            .select('-refreshToken -password')
            .session(session);

        if (!dbUser)
            return res
                .status(400)
                .json(
                    new ApiError(400, 'User Token not found, please relogin')
                );

        //authorize user
        if (dbUser.role !== 'eventAdmin' || dbUser.role !== 'superAdmin') {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'You are not authorized to change the event status'
                    )
                );
        }

        //check if the event already exists
        const eventExists = await Event.findById(event).session(session);

        if (!eventExists) {
            return res
                .status(400)
                .json(
                    new ApiError(
                        400,
                        'No such event avaliable or the event was deleted'
                    )
                );
        }

        if (status === eventExists.status) {
            return res.json(
                new ApiResponse(
                    200,
                    'Event status is already the same',
                    eventExists
                )
            );
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventExists._id,
            { status },
            { new: true, session: session }
        );

        if (!updatedEvent) {
            return res
                .status(400)
                .json(new ApiError(400, 'Error updating event status'));
        }

        await session.commitTransaction();
        session.endSession();

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    'Event status updated successfully',
                    updatedEvent
                )
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'Error in changing event status', [
                    error.message,
                ])
            );
    }
};
const getEventById = async (req, res) => {
    const { id: event } = req.params;

    if (!event) {
        return res.status(400).json(new ApiError(400, 'Event id is required'));
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const dbEvent = await Event.findById(event).session(session);
        if (!dbEvent) {
            return res
                .status(400)
                .json(new ApiError(400, 'No such event found'));
        }
        await session.commitTransaction();
        session.endSession();

        return res
            .status(200)
            .json(new ApiResponse(200, 'Event found', dbEvent));
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'Error in fetching event', [error.message])
            );
    }
};
export {
    createEvent,
    updateEvent,
    deleteEvent,
    getEventByMode,
    changeEventStatus,
    getEventByStatus,
    getEventById,
};

//TODO: Get event by id
