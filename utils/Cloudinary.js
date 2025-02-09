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

const deleteMedia = async (secureUrl) => {
    try {
        if (!secureUrl) {
            throw new Error('Secure URL is required.');
        }

        const urlParts = secureUrl.split('/');
        const versionIndex = urlParts.findIndex((part) => part.startsWith('v'));
        if (versionIndex === -1 || versionIndex + 1 >= urlParts.length) {
            throw new Error('Invalid Cloudinary URL format.');
        }

        let publicId = urlParts.slice(versionIndex + 1).join('/');
        publicId = publicId.substring(0, publicId.lastIndexOf('.'));
        console.log(`Deleting media with public ID: ${publicId}`);

        const result = await Cloudinary.uploader.destroy(publicId);
        console.log('Delete response:', result);
        return result;
    } catch (error) {
        console.error('Error in deleting the media:', error);
        return { success: false, error: error.message };
    }
};

export { uploadMedia, deleteMedia };
