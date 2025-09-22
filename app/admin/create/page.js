
'use client';
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BlogForm from '@/components/blogForms';
import { blogService } from '@/app/services/blogServices';

export default function CreateBlog() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data) => {
        try {
            setIsLoading(true);

            let imageUrl = null;

            // Handle image upload if provided
            if (data.image && data.image.length > 0) {
                const file = data.image[0];

                const maxSize = 3 * 1024 * 1024; 
                if (file.size > maxSize) {
                    alert('Ukuran file terlalu besar. Maksimal 3 MB.');
                    return; // stop total — jangan lanjut create blog
                }


                // Convert file to Base64
                const toBase64 = (file) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                    });

                const base64File = await toBase64(file);

                // Upload to Cloudinary via API route
                const uploadRes = await fetch('/api/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: base64File }),
                });

                const text = await uploadRes.text(); // always read as text first
                let uploadData;

                try {
                    uploadData = JSON.parse(text);
                } catch {
                    throw new Error(`Invalid JSON from upload API: ${text}`);
                }

                if (!uploadRes.ok) {
                    throw new Error(uploadData.error || 'Image upload failed');
                }

                imageUrl = uploadData.url;
            }

            // Build blog data (replace image with uploaded URL if exists)
            const blogData = {
                ...data,
                image: imageUrl || null,
            };

            // Save blog in Firestore
            const blogId = await blogService.createBlog(blogData);

            // Redirect to blog page
            router.push(`/blog/${blogId}`);
        } catch (error) {
            console.error('Error creating blog:', error);
            alert(error.message || 'Something went wrong while creating the blog');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head>
                <title>Create New Blog Post - My Blog</title>
            </Head>

            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
                        <Link href="/" className="text-blue-600 hover:text-blue-800">
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BlogForm onSubmit={handleSubmit} isLoading={isLoading} />
            </main>
        </div>
    );
}
