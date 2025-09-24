'use client';

import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, ArrowRight } from "lucide-react";
import Plant from "@/src/assets/plant 1.jpg"; // Your logo image

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 dark:bg-black text-white transition-colors duration-300">
            {/* Newsletter Section */}
            <div className="bg-green-600 dark:bg-green-700">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Subscribe to our Newsletter
                            </h3>
                            <p className="text-green-100">
                                Get the latest updates on new products and upcoming sales
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300"
                            />
                            <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center">
                                Subscribe
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {/* Company Info */}
                    <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                        <div className="flex items-center mb-6">
                            <div className="text-2xl font-bold text-green-600 mr-2">
                                <Image src={Plant} alt="logo" width={40} height={40} className="rounded-lg" />
                            </div>
                            <span className="text-2xl text-white font-bold">Nest Groceries</span>
                        </div>
                        <p className="text-gray-400 mb-6 leading-relaxed max-w-sm">
                            Your trusted partner for fresh, organic groceries delivered right to your doorstep.
                            Quality you can taste, service you can trust.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <div className="flex items-center text-green-400">
                                <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span>(219) 555-0114</span>
                            </div>
                            <div className="flex items-center text-gray-400">
                                <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span>info@nestgroceries.com</span>
                            </div>
                            <div className="flex items-start text-gray-400">
                                <MapPin className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                <span>123 Green Street, Nairobi, Kenya</span>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="mt-6">
                            <h4 className="text-white font-medium mb-3">Follow Us</h4>
                            <div className="flex space-x-3">
                                <Link href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-700 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                                    <Facebook className="w-5 h-5" />
                                </Link>
                                <Link href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-700 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                                    <Twitter className="w-5 h-5" />
                                </Link>
                                <Link href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-700 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                                    <Instagram className="w-5 h-5" />
                                </Link>
                                <Link href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-700 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                                    <Youtube className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* My Account */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">My Account</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/account" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>My Account</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/orders" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Order History</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Shopping Cart</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/wishlist" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Wishlist</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Help & Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Help & Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Contact Us</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>FAQ</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Terms & Conditions</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Privacy Policy</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Popular Categories</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/category/fruits-vegetables" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Fruits & Vegetables</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/meat-fish" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Meat & Fish</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/bread-bakery" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Bread & Bakery</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/dairy-eggs" className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span>Dairy & Eggs</span>
                                    <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-800 dark:border-gray-700">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm text-center sm:text-left">
                            © {currentYear} Nest Groceries. All rights reserved. Built with care for your health.
                        </p>

                        {/* Payment Methods */}
                        <div className="flex items-center space-x-3">
                            <span className="text-gray-400 text-sm mr-2">We accept:</span>
                            <div className="flex space-x-2">
                                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">VISA</span>
                                </div>
                                <div className="w-12 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">MC</span>
                                </div>
                                <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">PP</span>
                                </div>
                                <div className="w-12 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">M-P</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;