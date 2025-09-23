import Image from "next/image";
import Link from "next/link";
// import {categories} from "@/src/lib/data.ts";

// Import your category images
import FreshFruit from "../assets/categories/fresh-fruit.png";
import FreshVegetables from "../assets/categories/fresh-vegetables.png";
import Meat from "../assets/categories/meat.png";
import Beverage from "../assets/categories/beverage.png";
import BreadBakery from "../assets/categories/bread-bakery.png";
import Baking from "../assets/categories/baking.png";
import Cooking from "../assets/categories/cooking.png";
import DiabeticFoods from "../assets/categories/diabetic-foods.png";

const PopularCategories = () => {
    const categories = [
        { name: 'Fresh Fruit', image: FreshFruit, count: 134 },
        { name: 'Fresh Vegetables', image: FreshVegetables, count: 150 },
        { name: 'Meat & Fish', image: Meat, count: 54 },
        { name: 'Beverages', image: Beverage, count: 43 },
        { name: 'Bread & Bakery', image: BreadBakery, count: 15 },
        { name: 'Baking Needs', image: Baking, count: 21 },
        { name: 'Cooking', image: Cooking, count: 25 },
        { name: 'Diabetic Food', image: DiabeticFoods, count: 19 },
    ];

    return (
        <section className="py-12 lg:py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                        Popular Categories
                    </h2>
                    <Link
                        href="/categories"
                        className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium transition-colors duration-200 flex items-center group"
                    >
                        View All
                        <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </Link>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="group"
                        >
                            <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg text-center hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:-translate-y-1">
                                {/* Image Container */}
                                <div className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="object-contain rounded-lg"
                                        sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 80px"
                                    />
                                </div>

                                {/* Category Info */}
                                <div className="space-y-1">
                                    <h3 className="font-medium text-gray-800 dark:text-white text-sm md:text-base group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 line-clamp-2">
                                        {category.name}
                                    </h3>
                                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        ({category.count} items)
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View More Button for Mobile */}
                <div className="text-center mt-8 sm:hidden">
                    <Link
                        href="/categories"
                        className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                        View All Categories
                        <span className="ml-2">→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PopularCategories;