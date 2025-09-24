"use client"
import {useState} from "react";
const NewsLetter = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle newsletter subscription
        console.log('Newsletter subscription:', email);
        setEmail('');
    };

    return (
        <section className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 py-12 lg:py-16">
            <div className="container mx-auto px-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 lg:p-12 relative overflow-hidden">
                    <div className="text-4xl lg:text-6xl absolute right-4 lg:right-8 top-4 lg:top-8 opacity-20">🥬</div>
                    <div className="max-w-2xl relative z-10">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-600 dark:text-white mb-4 leading-tight">
                            Stay home & get your daily<br className="hidden sm:block" />
                            needs from our shop
                        </h2>
                        <p className="text-gray-300 mb-6 text-lg">Start Your Daily Shopping with Nest Mart</p>

                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mb-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                className="flex-1 px-4 py-3 rounded-full sm:rounded-l-full sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full sm:rounded-l-none sm:rounded-r-full font-medium transition-colors duration-200"
                            >
                                Subscribe
                            </button>
                        </form>

                        <div className="inline-flex items-center bg-orange-500/20 rounded-lg px-4 py-2">
                            <span className="text-2xl font-bold text-orange-400">37% OFF</span>
                            <span className="text-white ml-2">Limited Time Offer</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsLetter