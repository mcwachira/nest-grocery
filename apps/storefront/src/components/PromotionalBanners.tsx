
import Link from "next/link";
const PromotionalBanners = () => {
    return (
        <section className="py-12 lg:py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-6 md:p-8 rounded-lg relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                        <div className="text-4xl md:text-6xl absolute right-4 top-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">🥗</div>
                        <h3 className="text-xl font-bold mb-2">Sale of the Month</h3>
                        <div className="text-2xl md:text-3xl font-bold mb-4">
                            <span className="text-yellow-400">25%</span> OFF
                        </div>
                        <Link href="/sale">
                            <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200">
                                Shop Now →
                            </button>
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black text-white p-6 md:p-8 rounded-lg relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                        <div className="text-4xl md:text-6xl absolute right-4 top-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">🥩</div>
                        <h3 className="text-xl font-bold mb-2">Low-Fat Meat</h3>
                        <div className="text-2xl md:text-3xl font-bold mb-4">
                            <span className="text-red-400">85%</span> Fat Free
                        </div>
                        <Link href="/meat">
                            <button className="bg-white text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200">
                                Shop Now →
                            </button>
                        </Link>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 text-gray-800 dark:text-gray-900 p-6 md:p-8 rounded-lg relative overflow-hidden group hover:scale-105 transition-transform duration-300 md:col-span-2 lg:col-span-1">
                        <div className="text-4xl md:text-6xl absolute right-4 top-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">🍎</div>
                        <h3 className="text-xl font-bold mb-2">100% Fresh Fruit</h3>
                        <div className="text-2xl md:text-3xl font-bold mb-4">
                            <span className="text-red-600">Summer</span> Sale
                        </div>
                        <Link href="/fruits">
                            <button className="bg-gray-800 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-700 transition-colors duration-200">
                                Shop Now →
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default  PromotionalBanners