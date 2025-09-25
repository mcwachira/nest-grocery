
import Link from "next/link";
import {ArrowRight} from "lucide-react";
const PromotionalBanners = () => {
    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
                        Special Offers
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Don't miss out on these incredible deals and seasonal promotions
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Featured Banner */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-3xl p-10 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-3xl lg:text-4xl font-bold mb-4">Summer Sale Event</h3>
                                    <p className="text-blue-100 text-lg mb-6 max-w-md">Get up to 50% off on all fresh fruits and vegetables. Limited time offer!</p>
                                </div>
                                <div className="text-8xl opacity-20">🥗</div>
                            </div>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="text-center">
                                    <div className="text-5xl font-bold text-yellow-400">50%</div>
                                    <div className="text-blue-200">OFF</div>
                                </div>
                                <div className="text-sm">
                                    <div className="text-white font-semibold">Limited Time</div>
                                    <div className="text-blue-200">Valid until July 31st</div>
                                </div>
                            </div>

                            <Link href="/sale">
                                <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl">
                                    Shop Sale Items →
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Side Banners */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="relative z-10">
                                <div className="text-5xl mb-4">🥩</div>
                                <h4 className="text-2xl font-bold mb-2">Fresh Meat</h4>
                                <p className="text-green-100 mb-4">85% Fat Free Premium Quality</p>
                                <Link href="/meat">
                                    <button className="text-white font-medium hover:underline flex items-center group">
                                        Shop Now <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300">
                            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/20 rounded-full translate-y-14 -translate-x-14"></div>
                            <div className="relative z-10">
                                <div className="text-5xl mb-4">🍞</div>
                                <h4 className="text-2xl font-bold mb-2">Fresh Bakery</h4>
                                <p className="text-orange-100 mb-4">Baked Fresh Daily</p>
                                <Link href="/bakery">
                                    <button className="text-white font-medium hover:underline flex items-center group">
                                        Shop Now <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

    export default  PromotionalBanners