"use client"
import {useState} from "react";
const NewsLetter = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Newsletter subscription:', email);
        setEmail('');
    };

    return (
        <section className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 dark:from-green-600 dark:via-green-700 dark:to-emerald-700 py-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-300 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-3xl p-12 lg:p-16 border border-white/20 shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Stay Updated with
                                <span className="block text-yellow-300">Fresh Deals!</span>
                            </h2>
                            <p className="text-xl text-green-100 mb-8 leading-relaxed max-w-lg">
                                Subscribe to get special offers, free giveaways, and exclusive deals delivered to your inbox.
                            </p>

                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8 max-w-lg">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="flex-1 px-6 py-4 rounded-full bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-300/50 shadow-lg"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    Subscribe Now
                                </button>
                            </form>

                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <div className="inline-flex items-center bg-orange-500/90 rounded-full px-6 py-3 shadow-lg">
                                    <span className="text-2xl font-bold text-white mr-2">37% OFF</span>
                                    <span className="text-orange-100">for new subscribers</span>
                                </div>
                                <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2">
                                    <span className="text-white font-medium">📧 Join 10,000+ subscribers</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="relative">
                                <div className="text-8xl lg:text-9xl opacity-20 mb-6">📧</div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white/20 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">250+</div>
                                    <div className="text-xs text-green-100">Weekly Deals</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">50%</div>
                                    <div className="text-xs text-green-100">Avg Savings</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">24/7</div>
                                    <div className="text-xs text-green-100">Fresh Updates</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsLetter