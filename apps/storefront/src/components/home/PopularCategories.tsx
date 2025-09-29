"use client"
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PopularCategories = () => {
    const categories = [
        {
            name: 'Fresh Fruit',
            emoji: '🍎',
            count: 134,
            color: 'from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20',
            slug: 'fresh-fruit'
        },
        {
            name: 'Fresh Vegetables',
            emoji: '🥬',
            count: 150,
            color: 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
            slug: 'vegetables'
        },
        {
            name: 'Meat & Fish',
            emoji: '🥩',
            count: 54,
            color: 'from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20',
            slug: 'meat-fish'
        },
        {
            name: 'Beverages',
            emoji: '🥤',
            count: 43,
            color: 'from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20',
            slug: 'beverages'
        },
        {
            name: 'Bread & Bakery',
            emoji: '🍞',
            count: 15,
            color: 'from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20',
            slug: 'bread-bakery'
        },
        {
            name: 'Dairy Products',
            emoji: '🥛',
            count: 21,
            color: 'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
            slug: 'dairy-products'
        }
    ];

    return (
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute top-10 left-1/4 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4 lg:mb-6">
                        Shop by Category
                    </h2>
                    <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Discover our wide range of fresh, organic products across all categories
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 mb-8 lg:mb-12">
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            href={`/category/${category.slug}`}
                            className="group"
                        >
                            <div className={`bg-gradient-to-br ${category.color} p-6 lg:p-8 rounded-2xl lg:rounded-3xl text-center hover:shadow-xl dark:hover:shadow-gray-900/20 transition-all duration-300 hover:-translate-y-2 border border-white/50 dark:border-gray-600/50`}>
                                <div className="text-4xl lg:text-5xl mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                                    {category.emoji}
                                </div>
                                <h3 className="font-bold text-sm lg:text-base text-gray-800 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                    {category.name}
                                </h3>
                                <span className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-700/50 px-2 lg:px-3 py-1 rounded-full inline-block">
                                    {category.count} items
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/categories"
                        className="inline-flex items-center px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl group text-sm lg:text-base"
                    >
                        View All Categories
                        <ArrowRight className="ml-2 w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PopularCategories;