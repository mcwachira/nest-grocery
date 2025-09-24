
import Link from "next/link";
const PromotionalBanners = () => {
    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Banner */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold mb-4">Summer Sale Event</h3>
                            <p className="text-blue-100 mb-6">Get up to 50% off on all fresh fruits and vegetables</p>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-4xl font-bold text-yellow-400">50% OFF</div>
                                <div className="text-sm">
                                    <div>Limited time offer</div>
                                    <div className="text-blue-200">Valid until July 31st</div>
                                </div>
                            </div>
                            <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                                Shop Now →
                            </button>
                        </div>
                        <div className="absolute right-8 top-8 text-8xl opacity-20">🥗</div>
                    </div>

                    {/* Side Banners */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                            <div className="text-4xl mb-3">🥩</div>
                            <h4 className="font-bold mb-2">Fresh Meat</h4>
                            <p className="text-sm text-green-100 mb-3">85% Fat Free</p>
                            <button className="text-sm font-medium hover:underline">Shop Now →</button>
                        </div>

                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                            <div className="text-4xl mb-3">🍞</div>
                            <h4 className="font-bold mb-2">Fresh Bakery</h4>
                            <p className="text-sm text-orange-100 mb-3">Baked Daily</p>
                            <button className="text-sm font-medium hover:underline">Shop Now →</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )}
    export default  PromotionalBanners