"use client"
import {useState} from "react";

const PromotionalBanner = ({ currentCategory }) => {
    const [timeLeft] = useState({ days: 0, hours: 2, minutes: 18, seconds: 46 });

    const getBannerContent = () => {
        switch(currentCategory) {
            case 'Fresh Fruit':
                return { title: 'Fresh Fruit Sale', emoji: '🍎', discount: '40% OFF', color: 'from-orange-400 to-red-500' };
            case 'Vegetables':
                return { title: 'Fresh Vegetables', emoji: '🥬', discount: '56% OFF', color: 'from-green-500 to-green-700' };
            case 'Beverages':
                return { title: 'Drink Special', emoji: '🧃', discount: '25% OFF', color: 'from-blue-500 to-blue-700' };
            default:
                return { title: 'Sale of the Month', emoji: '🛒', discount: '56% OFF', color: 'from-gray-800 to-gray-700' };
        }
    };

    const banner = getBannerContent();

    return (
        <div className={`bg-gradient-to-r ${banner.color} text-white p-8 rounded-lg mb-6 relative overflow-hidden`}>
            <div className="absolute right-8 top-8 text-6xl opacity-20">{banner.emoji}</div>
            <div className="relative z-10">
                <span className="text-sm uppercase tracking-wide text-orange-300 font-medium">BEST DEALS</span>
                <h2 className="text-3xl font-bold mb-4">{banner.title}</h2>
                <div className="flex items-center gap-6 mb-6">
                    <div className="text-center">
                        <div className="bg-white text-gray-800 px-3 py-2 rounded-lg font-bold text-lg">
                            {String(timeLeft.days).padStart(2, '0')}
                        </div>
                        <span className="text-xs uppercase tracking-wide">Days</span>
                    </div>
                    <div className="text-center">
                        <div className="bg-white text-gray-800 px-3 py-2 rounded-lg font-bold text-lg">
                            {String(timeLeft.hours).padStart(2, '0')}
                        </div>
                        <span className="text-xs uppercase tracking-wide">Hours</span>
                    </div>
                    <div className="text-center">
                        <div className="bg-white text-gray-800 px-3 py-2 rounded-lg font-bold text-lg">
                            {String(timeLeft.minutes).padStart(2, '0')}
                        </div>
                        <span className="text-xs uppercase tracking-wide">Mins</span>
                    </div>
                    <div className="text-center">
                        <div className="bg-white text-gray-800 px-3 py-2 rounded-lg font-bold text-lg">
                            {String(timeLeft.seconds).padStart(2, '0')}
                        </div>
                        <span className="text-xs uppercase tracking-wide">Secs</span>
                    </div>
                </div>
                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Shop Now →
                </button>
            </div>
            <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full font-bold">
                {banner.discount}
            </div>
        </div>
    );
};

export default PromotionalBanner