const ValuePropositions = () => {
    return (
        <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="flex items-center space-x-4 p-6 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">64%</span>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Discount
                    </h3>
                    <p className="text-green-600 dark:text-green-500 text-sm">
                        Save your 64% money with us
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-4 p-6 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">100%</span>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Organic
                    </h3>
                    <p className="text-green-600 dark:text-green-500 text-sm">
                        100% Organic Vegetables
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ValuePropositions;