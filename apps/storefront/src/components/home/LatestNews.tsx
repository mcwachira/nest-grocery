'use client';

import Image from "next/image";
import Link from "next/link";
import { Calendar, MessageCircle, User, ArrowRight, Clock } from "lucide-react"

const LatestNews = () => {
    const news = [
        {
            image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&h=240&fit=crop&auto=format&q=80',
            title: 'The Benefits of Organic Farming for Your Health',
            excerpt: 'Discover how organic farming practices contribute to better nutrition and environmental sustainability.',
            author: 'Sarah Johnson',
            category: 'Health',
            date: '18 Nov',
            readTime: '5 min read',
            comments: 65,
            slug: 'benefits-organic-farming-health'
        },
        {
            image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=240&fit=crop&auto=format&q=80',
            title: '10 Seasonal Recipes Using Fresh Local Ingredients',
            excerpt: 'Explore delicious recipes that make the most of seasonal produce from your local farmers market.',
            author: 'Michael Chen',
            category: 'Recipes',
            date: '29 Jan',
            readTime: '8 min read',
            comments: 42,
            slug: 'seasonal-recipes-local-ingredients'
        },
        {
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=240&fit=crop&auto=format&q=80',
            title: 'Sustainable Packaging: Our Commitment to the Environment',
            excerpt: 'Learn about our new eco-friendly packaging initiatives and how they help reduce environmental impact.',
            author: 'Emma Davis',
            category: 'Sustainability',
            date: '21 Feb',
            readTime: '6 min read',
            comments: 38,
            slug: 'sustainable-packaging-environment'
        }
    ];

    return (
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
<div className="container mx-auto px-4">
{/*    Header  */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                Latest News
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
                Stay updated with the latest trends and insights
            </p>
        </div>

        <Link
            href="/blog"
            className="inline-flex items-center text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors duration-200 group"
        >
            View All Articles
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
    </div>

{/*    News Grid */}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {
            news.map((item, index) => (
                <article
                    key={index}
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-2"
                >

                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden">
                        <Image src={item.image} alt={item.title} fill
                               className="object-cover group-hover:scale-110 transition-transform duration-500"
                               sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"/>

                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>

                    {/*Category Badge */}
                        <div className="absolute top-4 left-4">
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium  bg-green-600 text-white rounded-full">
{item.category}

                            </span>
                        </div>

                    </div>

                {/*    Content */}

                    <div className="p-6">
                        {/* Meta Information */}
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 space-x-4">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                <span>{item.author}</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{item.date}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{item.readTime}</span>
                            </div>
                        </div>
                        {/* Title */}
                        <Link href={`/blog/${item.slug}`}>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 cursor-pointer">
                                {item.title}
                            </h3>
                        </Link>

                        {/* Excerpt */}
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                            {item.excerpt}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                <span>{item.comments} Comments</span>
                            </div>

                            <Link
                                href={`/blog/${item.slug}`}
                                className="inline-flex items-center text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium text-sm transition-colors duration-200 group"
                            >
                                Read More
                                <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                            </Link>
                        </div>
                    </div>
                </article>
            ))
        }
    </div>
    {/* Load More Button for Mobile */}
    <div className="text-center mt-12 sm:hidden">
        <Link
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
            View All Articles
            <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
    </div>
</div>
        </section>
    );
};

export default LatestNews