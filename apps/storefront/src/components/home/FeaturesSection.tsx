import {CreditCard, Headphones, RefreshCw, Truck, Shield} from "lucide-react";

const FeaturesSection = () => {
    const features = [
        { icon: Truck, title: "Free Shipping", desc: "Free shipping worldwide on orders over $50", color: "from-blue-500 to-blue-600" },
        { icon: Headphones, title: "24/7 Support", desc: "Round-the-clock customer support", color: "from-green-500 to-green-600" },
        { icon: Shield, title: "100% Secure", desc: "Advanced security for all payments", color: "from-purple-500 to-purple-600" },
        { icon: RefreshCw, title: "Money Back", desc: "30-day money-back guarantee", color: "from-orange-500 to-orange-600" }
    ];

    return (
        <section className="py-20 bg-white dark:bg-gray-900 relative">
            {/* Decorative background */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
                <div className="absolute top-20 left-20 w-32 h-32 bg-green-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
                        Why Choose Us
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        We're committed to providing you with the best shopping experience through our premium services
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="group text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg dark:shadow-gray-900/20 hover:shadow-2xl dark:hover:shadow-gray-900/40 transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                            <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <feature.icon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;