"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import BlogForm from "@/components/blogForms";
import { blogService } from "@/app/services/blogServices";

export default function EditBlog() {
  const router = useRouter();
  const params = useParams();     
  const id = params?.id;          

  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlog(id);
    }
  }, [id]);

  const fetchBlog = async (blogId) => {
    try {
      const blogData = await blogService.getBlogById(blogId);
      if (blogData) {
        setBlog(blogData);
      } else {
        router.push("/404");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async (data) => {
  //   try {
  //     setIsLoading(true);
  //     await blogService.updateBlog(id, data);
  //     router.push(`/blog/${id}`);
  //   } catch (error) {
  //     console.error("Error updating blog:", error);
  //     alert("Error updating blog post. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);

      let updatedData = { ...data };

      // If user selected a new file (FileList object, not string)
      if (data.image && data.image.length > 0 && data.image[0] instanceof File) {
        const file = data.image[0];

        // Convert to Base64
        const toBase64 = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
          });

        const base64File = await toBase64(file);

        // Upload new image to Cloudinary
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64File }),
        });

        const text = await uploadRes.text();
        let uploadData;

        try {
          uploadData = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON from upload API: ${text}`);
        }

        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Image upload failed');
        }

        // Replace image with Cloudinary URL
        updatedData.image = uploadData.url;
      } else if (typeof data.image === 'string') {
        // User didn’t upload new image — keep existing Cloudinary URL
        updatedData.image = data.image;
      } else {
        // No image provided
        updatedData.image = null;
      }

      // Update blog in DB
      await blogService.updateBlog(id, updatedData);

      // Redirect back to blog post
      router.push(`/blog/${id}`);
    } catch (error) {
      console.error('Error updating blog:', error);
      alert(error.message || 'Error updating blog post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      try {
        await blogService.deleteBlog(id);
        router.push("/");
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Error deleting blog post. Please try again.");
      }
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Blog post not found
          </h1>
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
        <title>Edit: {blog.title} - My Blog</title>
      </Head>

      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Blog Post
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800"
              >
                Delete Post
              </button>
              <Link
                href={`/blog/${id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to post
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogForm
          onSubmit={handleSubmit}
          initialData={blog}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
