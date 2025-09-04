import Link from 'next/link';
import Image from 'next/image';

export default function BlogCard({ blog }) {
    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full">
                <Image
                    src={blog.image || '/placeholder-image.jpg'}
                    alt={blog.title}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold">
                        {blog.category}
                    </span>
                    <span className="text-gray-500 text-sm">
                        {formatDate(blog.createdAt)}
                    </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                    <Link href={`/blog/${blog.id}`} className="hover:text-blue-600">
                        {blog.title}
                    </Link>
                </h2>
                <div className="text-gray-600 text-sm line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: blog.description }}
                >
                </div>
                <div className="mt-4">
                    <Link
                        href={`/blog/${blog.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Read more →
                    </Link>
                </div>
            </div>
        </div>
    );
}