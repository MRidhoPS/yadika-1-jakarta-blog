import cloudinary from 'cloudinary';

// 1. Configure Cloudinary (server-side)
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '3mb', // allow big files
        },
    },
};

export async function POST(req) {
    try {
        const body = await req.json(); // read JSON body
        const { file } = body;

        if (!file) {
            return new Response(
                JSON.stringify({ error: 'No file provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Upload base64 file to Cloudinary
        const uploaded = await cloudinary.uploader.upload(file, {
            folder: 'blog',
        });

        // Return the secure URL as JSON
        return new Response(
            JSON.stringify({ url: uploaded.secure_url }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        return new Response(
            JSON.stringify({ error: 'Upload failed', details: err.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}