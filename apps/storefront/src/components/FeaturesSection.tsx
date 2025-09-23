import {CreditCard, Headphones, RefreshCw, Truck} from "lucide-react";

const FeaturesSection = () => {
    const features = [
        {
            icon: <Truck className="w-8 h-8" />,
            title: "Free Shipping",
            desc: "Free shipping on all your order"
        },
        {
            icon: <Headphones className="w-8 h-8" />,
            title: "Customer Support 24/7",
            desc: "Instant access to Support"
        },
        {
            icon: <CreditCard className="w-8 h-8" />,
            title: "100% Secure Payment",
            desc: "We ensure your money is save"
        },
        {
            icon: <RefreshCw className="w-8 h-8" />,
            title: "Money-Back Guarantee",
            desc: "30 days money-back guarantee"
        }
    ];

    return (
        <section className="py-12 lg:py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center text-center sm:text-left lg:text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-lg dark:hover:shadow-gray-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="text-green-600 dark:text-green-500 mb-4 sm:mb-0 sm:mr-4 lg:mb-4 lg:mr-0 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-gray-800 dark:text-white text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;