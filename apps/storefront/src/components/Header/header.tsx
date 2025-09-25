'use client';

import { Heart, MapPin, Menu, Phone, Search, ShoppingCart, User, X, Sun, Moon, ChevronDown } from "lucide-react";
import Image from "next/image";
import Plant from "@/src/assets/plant 1.jpg";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {ThemeToggle} from "@/src/components/theme/ThemeToggle.tsx";

const Header = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const sidebarRef = useRef(null);

    const categories = [
        { name: 'Fresh Fruit', icon: '🍎' },
        { name: 'Vegetables', icon: '🥕' },
        { name: 'River Fish', icon: '🐟' },
        { name: 'Chicken & Meat', icon: '🍗' },
        { name: 'Drink & Water', icon: '🥤' },
        { name: 'Yogurt & Ice Cream', icon: '🍦' },
        { name: 'Cake & Bread', icon: '🍰' },
        { name: 'Butter & Cream', icon: '🧈' },
        { name: 'Cooking', icon: '🍳' },
        { name: 'View all Category', icon: '📋' }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSidebarOpen]);

    return (
        <>
            <header className="relative z-50">
                {/* Top Bar */}
                <div className="bg-gray-100 dark:bg-gray-800 text-sm py-2 hidden md:block">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                            <span className="flex items-center text-gray-600 dark:text-gray-300">
                                <MapPin className="w-4 h-4 mr-1" />
                                Store Location: Nairobi Kenya
                            </span>
                        </div>

                        <div className="flex items-center space-x-6 dark:text-gray-300">
                            <span className="cursor-pointer hover:text-green-600">Eng</span>
                            <span className="cursor-pointer hover:text-green-600">USD</span>
                            <span className="cursor-pointer hover:text-green-600">Sign In / Sign Up</span>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="text-2xl font-bold text-green-600 mr-2">
                                    <Image src={Plant} alt="logo" width={50} height={50} className="rounded-lg" />
                                </div>
                                <span className="text-2xl text-green-600 dark:text-green-500 font-bold hidden sm:block">
                                    Nest Groceries
                                </span>
                            </div>

                            {/* Search Bar - hidden on mobile */}
                            <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search for products ..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-24 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
                                    >
                                        Search
                                    </button>
                                </form>
                            </div>

                            {/* Right Side Icons */}
                            <div className="flex items-center space-x-4">
                                <ThemeToggle />

                                <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                </button>

                                <Heart className="w-6 h-6 cursor-pointer hover:text-green-600 dark:text-gray-300 hidden sm:block transition-colors duration-200" />

                                <div className="relative">
                                    <ShoppingCart className="w-6 h-6 cursor-pointer hover:text-green-600 dark:text-gray-300 transition-colors duration-200" />
                                    <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                        2
                                    </span>
                                </div>

                                <div className="hidden md:flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                                    <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">$57.00</span>
                                </div>

                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {isMobileMenuOpen ? (
                                        <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                    ) : (
                                        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="bg-gray-800 dark:bg-gray-900 text-white hidden md:block relative">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center">
                            {/* Categories Dropdown */}
                            <div className="relative" ref={sidebarRef}>
                                <div
                                    className="flex items-center bg-green-600 hover:bg-green-700 px-4 py-3 rounded-sm mr-6 cursor-pointer transition-colors duration-200"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                >
                                    <Menu className="w-5 h-5 mr-2" />
                                    <span>All Categories</span>
                                    <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isSidebarOpen ? 'rotate-180' : ''}`} />
                                </div>

                                {/* Dropdown Categories Sidebar */}
                                {isSidebarOpen && (
                                    <div className="absolute top-full left-0 w-80 bg-white dark:bg-gray-800 shadow-2xl border dark:border-gray-700 rounded-b-lg z-50 max-h-96 overflow-y-auto">
                                        <ul className="py-2">
                                            {categories.map((category, index) => (
                                                <li key={index}>
                                                    <Link
                                                        href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                                        onClick={() => setIsSidebarOpen(false)}
                                                    >
                                                        <span className="text-lg mr-3">{category.icon}</span>
                                                        <span className="text-sm font-medium">{category.name}</span>
                                                        {category.name === 'Vegetables' && (
                                                            <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                                Active
                                                            </span>
                                                        )}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <ul className="flex space-x-8 py-3">
                                <li><Link href="/" className="hover:text-green-400 transition-colors duration-200">Home</Link></li>
                                <li><Link href="/shop" className="hover:text-green-400 transition-colors duration-200">Shop</Link></li>
                                <li><Link href="/about" className="hover:text-green-400 transition-colors duration-200">About Us</Link></li>
                                <li><Link href="/blog" className="hover:text-green-400 transition-colors duration-200">Blog</Link></li>
                                <li><Link href="/contact-us" className="hover:text-green-400 transition-colors duration-200">Contact Us</Link></li>
                            </ul>

                            <div className="ml-auto flex items-center space-x-4">
                                <Phone className="w-4 h-4" />
                                <span>(219) 555-0114</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-lg">
                        {/* Mobile Search */}
                        <div className="p-4 border-b dark:border-gray-700">
                            <form onSubmit={handleSearch} className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search for products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-20 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm"
                                >
                                    Search
                                </button>
                            </form>
                        </div>

                        {/* Mobile Navigation */}
                        <ul className="py-2">
                            <li><Link href="/" className="block px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Home</Link></li>
                            <li><Link href="/shop" className="block px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Shop</Link></li>
                            <li><Link href="/about" className="block px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">About Us</Link></li>
                            <li><Link href="/blog" className="block px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Blog</Link></li>
                            <li><Link href="/contact-us" className="block px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Contact Us</Link></li>
                        </ul>

                        {/* Mobile Categories Toggle */}
                        <div className="border-t dark:border-gray-700 p-4">
                            <button
                                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                                className="w-full flex items-center justify-between bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors duration-200"
                            >
                                <div className="flex items-center">
                                    <Menu className="w-5 h-5 mr-2" />
                                    <span className="font-medium">Categories</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Collapsible Categories List */}
                            {mobileCategoriesOpen && (
                                <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                                    <ul className="py-2">
                                        {categories.map((category, index) => (
                                            <li key={index}>
                                                <Link
                                                    href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                                    className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                                                    onClick={() => {
                                                        setMobileCategoriesOpen(false);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    <span className="text-lg mr-3">{category.icon}</span>
                                                    <span className="text-sm font-medium">{category.name}</span>
                                                    {category.name === 'Vegetables' && (
                                                        <span className="ml-auto bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                            Active
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Mobile Contact */}
                        <div className="border-t dark:border-gray-700 p-4 flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Phone className="w-4 h-4" />
                            <span>(219) 555-0114</span>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;