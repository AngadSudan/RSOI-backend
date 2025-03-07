import { uploadMedia, deleteMedia } from '../utils/Cloudinary.js';
import User from '../models/user.models.js';
import Event from '../models/events.models.js';
import { ApiError, ApiResponse } from '../utils/index.js';
const createEvent = async (req, res) => {
    const { name, description, timeline, mode, location, eventLink } = req.body;
    const user = req.user._id;

    console.log('Request Body:', req.body);
    console.log('File:', req.file);

    const imagePath = req.file?.path;

    try {
        if (!user) {
            throw new Error('user token not found, please relogin');
        }
        if (!name) {
            throw new Error('An event without a name cannot be registered');
        }
        if (!description || description.trim().length < 50) {
            throw new Error(
                'Please provide a detailed description of the event'
            );
        }

        if (!timeline) {
            throw new Error("an event without a timeline can't be registered");
        }
        if (!mode) {
            throw new Error(
                "please specify the mode of the event 'online' or 'offline'"
            );
        }
        if (!location && mode === 'offline') {
            throw new Error('please specify the location of the event');
        }
        if (!eventLink && mode === 'online') {
            throw new Error("please provide the event's link");
        }

        const dbUser = await User.findById(user).select(
            '-refreshToken -password'
        );

        if (!dbUser) throw new Error('no such user found in the database');
        //authorize user

        if (dbUser.role === 'membershipAdmin') {
            throw new Error('you are not authorized to create an event');
        }
        let imageLink = '';
        //cloudinary upload
        if (imagePath) {
            const result = await uploadMedia(imagePath);
            console.log(result);
            if (!result) {
                throw new Error('error in uploading image on server');
            }
            imageLink = result.secure_url;
        }
        //check if the event already exists

        const eventExists = await Event.findOne({ name });
        if (eventExists) {
            throw new Error(
                "Event with this name already exists, can't create"
            );
        }

        const createdEvent = await Event.create({
            name,
            description,
            timeline,
            location,
            mode,
            eventLink,
            imageLink:
                imageLink ||
                'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.com%2Ffree-vector%2Fabstract-background-with-a-watercolor-splash_1055781.htm&psig=AOvVaw3',
            createdBy: dbUser._id,
        });

        if (!createdEvent) {
            throw new Error('server failed to create the event');
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, createdEvent, 'Event created successfully')
            );
    } catch (error) {
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

    const imagePath = req.file?.path;
    if (!user) {
        throw new Error('user token not found, please relogin');
    }
    if (!event) {
        throw new Error("please provide the event's id to update the event");
    }

    try {
        const dbUser = await User.findById(user).select(
            '-refreshToken -password'
        );

        if (!dbUser) throw new Error('no such user found in the database');
        //authorize user

        if (dbUser.role === 'membershipAdmin') {
            throw new Error('you are not authorized to create an event');
        }

        //check if the event already exists
        const eventExists = await Event.findById(event);

        if (!eventExists) {
            throw new Error('No such event avaliable or the event was deleted');
        }

        let imageLink = eventExists.imageLink;

        //cloudinary upload
        if (imagePath) {
            //delete the previoud link from the database
            const deletedUrl = await deleteMedia(imageLink);
            if (!deletedUrl) {
                throw new Error('error in deleting the previous image');
            }
            const result = await uploadMedia(imagePath);

            if (!result) {
                throw new Error('error in uploading the image on server');
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
            { new: true }
        );

        if (!updatedEvent) {
            throw new Error('server failed to update the event');
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, 'Event updated successfully', updatedEvent)
            );
    } catch (error) {
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

    try {
        const dbUser = await User.findById(user).select(
            '-refreshToken -password'
        );
        if (!dbUser)
            return res
                .status(400)
                .json(
                    new ApiError(400, 'User Token not found, please relogin')
                );
        //authorize user

        if (dbUser.role === 'user' || dbUser.role === 'membershipAdmin') {
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
        const eventExists = await Event.findById(event);

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
            { new: true }
        );

        if (!deleteEvent) {
            return res
                .status(400)
                .json(new ApiError(400, 'Error deleting event'));
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, 'Event deleted successfully', deletedEvent)
            );
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'error in deleting an event', [error.message])
            );
    }
};
const getEventByMode = async (req, res) => {
    let { mode } = req.body;

    try {
        let dbEvents = [];
        if (mode) {
            dbEvents = await Event.find({ mode });
        } else {
            dbEvents = await Event.find({
                mode: {
                    $in: ['offline', 'online', 'hybrid'],
                },
            });
        }

        if (!dbEvents || dbEvents.length === 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, [], 'no Event data found'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, dbEvents, 'Event data found'));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'Error in fetching events', [error.message])
            );
    }
};
const getEventByStatus = async (req, res) => {
    let { status } = req.body;

    try {
        let dbEvents = [];
        if (status) {
            //status = ['upcoming', 'ongoing', 'past'];
            dbEvents = await Event.find({ status });
        } else {
            dbEvents = await Event.find({
                status: {
                    $in: ['upcoming', 'ongoing', 'past'],
                },
            });
        }

        if (!dbEvents || dbEvents.length === 0) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        [],
                        'no events found with the following status found'
                    )
                );
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    dbEvents,
                    ' events found with the following status found'
                )
            );
    } catch (error) {
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
        throw new Error('user token not found, please relogin');
    }
    if (!status) {
        throw new Error('Event status is required');
    }
    if (!event) {
        throw new Error('please give the event id');
    }

    try {
        const dbUser = await User.findById(user).select(
            '-refreshToken -password'
        );

        if (!dbUser) throw new Error('no such user found in the database');

        //authorize user
        if (dbUser.role === 'membershipAdmin') {
            throw new Error(
                "you are not authorized to change the event's status"
            );
        }

        //check if the event already exists
        const eventExists = await Event.findById(event);

        if (!eventExists) {
            throw new Error('no such event exists, try creating one');
        }

        if (status === eventExists.status) {
            throw new Error('Event is already in the same state');
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventExists._id,
            { status },
            { new: true }
        );

        if (!updatedEvent) {
            throw new Error("server failed to update the event's status");
        }

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

    try {
        const dbEvent = await Event.findById(event);
        if (!dbEvent) {
            return res
                .status(400)
                .json(new ApiError(400, 'No such event found'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, 'Event found', dbEvent));
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(
                new ApiError(500, 'Error in fetching event', [error.message])
            );
    }
};

const getEventByName = async (req, res) => {
    const { text: event } = req.body;

    if (!event) {
        return res.status(400).json(new ApiError(400, 'Event id is required'));
    }

    try {
        console.log(event);
        const dbEvent = await Event.findOne({ name: event });
        if (!dbEvent) {
            return res
                .status(400)
                .json(new ApiError(400, 'No such event found'));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, dbEvent, 'Event found'));
    } catch (error) {
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
    changeEventStatus,
    getEventByMode,
    getEventByStatus,
    getEventById,
    getEventByName,
};

//TODO: Get event by id
