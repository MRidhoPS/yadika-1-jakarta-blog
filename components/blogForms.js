'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import dynamic from 'next/dynamic';
// import ReactQuill from 'react-quill-new';
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function BlogForm({ onSubmit, initialData = {}, isLoading = false }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: initialData,
    });

    const [preview, setPreview] = useState(initialData.image || null);
    const [content, setContent] = useState(initialData.description || '');

    const categories = ['Prestasi', 'Pengumuman', 'Event'];

    // Preview image cover (optional)
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    // Konfigurasi toolbar ReactQuill
    // const modules = {
    //     toolbar: [
    //         ['bold', 'italic', 'underline', 'strike'],     // formatting
    //         [{ header: [1, 2, 3, false] }],               // heading
    //         [{ list: 'ordered' }, { list: 'bullet' }],    // list
    //         ['link', 'image'],                            // link & image via URL
    //         ['clean'],                                    // clear format
    //     ],
    // };

    const modules = {
        toolbar: {
            container: [
                [{ header: '1' }, { header: '2' }, { font: [] }],
                [{ size: [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: async function () {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();
                    input.onchange = async () => {
                        const file = input.files[0];
                        if (file) {
                            const toBase64 = (file) =>
                                new Promise((resolve, reject) => {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(file);
                                    reader.onload = () => resolve(reader.result);
                                    reader.onerror = reject;
                                });

                            const base64File = await toBase64(file);

                            const uploadRes = await fetch('/api/upload-image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ file: base64File }),
                            });

                            const uploadData = await uploadRes.json();

                            if (uploadRes.ok && uploadData.url) {
                                const quill = this.quill;
                                const range = quill.getSelection();
                                quill.insertEmbed(range.index, 'image', uploadData.url);
                            } else {
                                alert('Image upload failed');
                            }
                        }
                    };
                }
            }
        }
    };

    // Submit form: gabungkan data react-hook-form & editor content
    const handleFormSubmit = (data) => {
        const finalData = {
            ...data,
            description: content, // ambil dari ReactQuill
        };
        onSubmit(finalData);
    };

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"
        >
            {/* Title */}
            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                </label>
                <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter blog title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                </label>
                <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>

            {/* Cover Image */}
            <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image *
                </label>
                <input
                    {...register('image', { required: 'Image is required' })}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {preview && (
                    <img
                        src={preview}
                        alt="Preview"
                        className="mt-2 max-h-48 rounded-md border border-gray-300"
                    />
                )}
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
            </div>

            {/* Description pakai Blog Editor */}
            <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                </label>
                <ReactQuill
                    key="blog-editor"
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    placeholder="Write your blog content here..."
                />
                {!content && <p className="text-red-500 text-sm mt-1">Description is required</p>}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Saving...' : initialData.id ? 'Update Blog' : 'Create Blog'}
            </button>
        </form>
    );
}


// 'use client';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';

// export default function BlogForm({ onSubmit, initialData = {}, isLoading = false }) {
//     const { register, handleSubmit, formState: { errors } } = useForm({
//         defaultValues: initialData,
//     });

//     const [preview, setPreview] = useState(initialData.image || null);

//     const categories = ['Prestasi', 'Pengumuman', 'Event'];

//     // Convert file to base64 for preview (optional)
//     const handleImageChange = (e) => {
//         const file = e.target.files?.[0];
//         if (!file) return;
//         const reader = new FileReader();
//         reader.onloadend = () => {
//             setPreview(reader.result);
//         };
//         reader.readAsDataURL(file);
//     };

//     return (
//         <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md"
//         >
//             <div className="mb-4">
//                 <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
//                     Title *
//                 </label>
//                 <input
//                     {...register('title', { required: 'Title is required' })}
//                     type="text"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter blog title"
//                 />
//                 {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
//             </div>

//             <div className="mb-4">
//                 <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
//                     Category *
//                 </label>
//                 <select
//                     {...register('category', { required: 'Category is required' })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                     <option value="">Select a category</option>
//                     {categories.map((category) => (
//                         <option key={category} value={category}>
//                             {category}
//                         </option>
//                     ))}
//                 </select>
//                 {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
//             </div>

//             <div className="mb-4">
//                 <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
//                     Upload Image *
//                 </label>
//                 <input
//                     {...register('image', { required: 'Image is required' })}
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 {preview && (
//                     <img
//                         src={preview}
//                         alt="Preview"
//                         className="mt-2 max-h-48 rounded-md border border-gray-300"
//                     />
//                 )}
//                 {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
//             </div>

//             <div className="mb-6">
//                 <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
//                     Description *
//                 </label>
//                 <textarea
//                     {...register('description', { required: 'Description is required' })}
//                     rows="6"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Write your blog content here..."
//                 />
//                 {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
//             </div>

//             <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//                 {isLoading ? 'Saving...' : initialData.id ? 'Update Blog' : 'Create Blog'}
//             </button>
//         </form>
//     );
// }
