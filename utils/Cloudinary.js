import { v2 as Cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config({});

Cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

const uploadMedia = async (file) => {
    try {
        return await Cloudinary.uploader.upload(file, {
            resource_type: auto,
        });
    } catch (error) {
        console.log('error in uploading media to cloudinary', error);
    }
};

const deleteMedia = async (publicId) => {
    try {
        return await Cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log('error in deleting the media', error);
    }
};

export { uploadMedia, deleteMedia };
