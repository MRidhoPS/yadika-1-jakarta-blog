'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { blogService } from '@/app/services/blogServices';
import "react-quill-new/dist/quill.snow.css";
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });


export default function BlogPost() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchBlog();
        }
    }, [id]);

    const fetchBlog = async () => {
        try {
            const blogData = await blogService.getBlogById(id);
            if (blogData) {
                setBlog(blogData);
            } else {
                router.push('/404');
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-gray-100 flex justify-center items-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h1>
                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                        ← Back to home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Head>
                <title>{blog.title} - My Blog</title>
                <meta name="description" content={blog.description.substring(0, 160)} />
            </Head>

            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/" className="text-blue-600 hover:text-blue-800">
                        ← Back to home
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <article className="bg-white rounded-lg shadow-md overflow-hidden">
                    {blog.image && (
                        <div className="relative h-64 md:h-96 w-full">
                            <Image
                                src={blog.image}
                                alt={blog.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-4">
                            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full uppercase tracking-wide font-semibold">
                                {blog.category}
                            </span>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <Link
                                    href={`/admin/edit/${blog.id}`}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Edit
                                </Link>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {blog.title}
                        </h1>

                        <div className="flex items-center text-sm text-gray-500 mb-6">
                            <span>Created: {formatDate(blog.createdAt)}</span>
                            {blog.updatedAt && blog.updatedAt > blog.createdAt && (
                                <span className="ml-4">Updated: {formatDate(blog.updatedAt)}</span>
                            )}
                        </div>

                        <div className="prose max-w-none ql-editor">
                            <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.description }}>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
