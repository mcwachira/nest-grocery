'use client';

import { useState } from 'react';
import { Star, User, CheckCircle, Play } from 'lucide-react';
import Image  from "next/image";

interface ProductTabsProps {
    description: string;
    additionalInfo: {
        weight: string;
        color: string;
        type: string;
        category: string;
        stockStatus: string;
        tags: string;
    };
    reviews: Array<{
        id: number;
        name: string;
        rating: number;
        date: string;
        comment: string;
        verified: boolean;
    }>;
}

 const ProductTabs = ({ description, additionalInfo, reviews }: ProductTabsProps) => {
    const [activeTab, setActiveTab] = useState('descriptions');

    const tabs = [
        {id: 'descriptions', label: 'Descriptions'},
        {id: 'additional', label: 'Additional Information'},
        {id: 'reviews', label: 'Customer Feedback'}
    ];

return (

    <div className="mt-12">
    {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex spaxe-x-8">
                {
                    tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))
                }
            </nav>
        </div>


    {/* Tab Content */}
        <div className="py-8">
            {activeTab === 'descriptions' && (
                <div className="grid md:grid-cols-2 gap-8 items-center">

                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {description}
                    </p>


                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">
                    Sit et diam maximus accumsan
                  </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">
                     Aliquam ut dui et augue maxime aliquam sit luctus
                  </span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">
               Quisque nec tellus eget ipsum sodales
                  </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">
                    Etiam consectetuer tellus adipiscing finibus porttitor
                  </span>
                        </div>
                        </div>
                    </div>


                    <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                        <div className="relative">
                            <div className="w-32 h-32 bg-green-600 rounded-full mx-auto mb-4 flex items-center ">
                                <Play className="w-12 h-12 text-white ml-1"/>

                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">

                                Organic Only
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400">
                                100% Organic Vegetables
                            </p>


                        </div>

                    </div>
                </div>

            )}


            {activeTab === 'additional' && (

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {Object.entries(additionalInfo).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                  </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                    {value}
                  </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-4 flex items-center">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
100% Organic
                            </h3>

                            <p className="text-gray-600 dark:text-gray-400">

                                100% Organic Vegetables
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="space-y-6">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                    {review.name}
                                                </h4>
                                                {review.verified && (
                                                    <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                              Verified
                            </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                          {review.date}
                        </span>
                                        </div>

                                        <div className="flex items-center mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i < review.rating
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300 dark:text-gray-600'
                                                    }`}
                                                />
                                            ))}
                                        </div>

                                        <p className="text-gray-700 dark:text-gray-300">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">
                                No reviews yet. Be the first to review this product!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
);
};

export default ProductTabs