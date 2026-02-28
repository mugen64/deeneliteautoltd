import { createServerFn } from '@tanstack/react-start';
import { v2 as cloudinary } from 'cloudinary';

export const generateFileUploadSignature = createServerFn({ method: 'POST' })
    .inputValidator((data: { folder?: string }) => data)
    .handler(({ data }) => {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsToSign: Record<string, string | number> = { timestamp };
        
        if (data.folder) {
            paramsToSign.folder = data.folder;
        }
        
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET || ''
        );
        
        return {
            timestamp,
            signature,
            folder: data.folder,
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
        };
    });