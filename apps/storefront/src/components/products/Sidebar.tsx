import {useState} from "react";
import {ChevronDown, Star, X} from "lucide-react";
import {categories, saleProducts, tags} from "@/src/lib/data.ts";


const Sidebar = ({ isMobile, onClose, selectedCategory, onCategoryChange }) => {

    const [priceRange, setPriceRange] = useState([50, 100])
    const [selectedRating, setSelectedRating] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        rating: true,
        tags: true,
        sale: true
    });

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }) )
    }

    const sidebarContent = (

        <div className="space-y-6">
        {/* Filter Button for Mobile */}

            {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

        {/* All Categories */}

            <div className="bg-=card rounded-lg p-6">
                <button
                    onClick={() => toggleSection('categories')}
                    className="flex items-center justify-between w-full mb-4"
                >
                    <h3 className="text-lg font-semibold">All Categories</h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`} />
                </button>

                {expandedSections.categories && (
                    <ul className="space-y-2">
                        {categories.map((category, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => onCategoryChange(category.name)}
                                    className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors w-full text-left ${
                                        selectedCategory === category.name
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                >
                                    <span className="text-sm">{category.name}</span>
                                    <span className="text-xs">({category.count})</span>
                                </button>
                            </li>
                        ))}

                    </ul>
                )}
            </div>

        {/* Price Filter */}

            <div className="bg-card rounded-lg p-6">
                <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full mb-4"
                >
                    <h3 className="text-lg font-semibold">Price</h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
                </button>

                {expandedSections.price&& (
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="h-2 bg-muted rounded-full">
                                <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: '60%' }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                <span>Price: $0 – $50</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Rating Filter */}
            <div className="bg-card rounded-lg p-6">
                <button
                    onClick={() => toggleSection('rating')}
                    className="flex items-center justify-between w-full mb-4"
                >
                    <h3 className="text-lg font-semibold">Rating</h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`} />
                </button>

                {expandedSections.rating && (
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <label key={rating} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="rating"
                                    value={rating}
                                    checked={selectedRating === rating}
                                    onChange={() => setSelectedRating(rating)}
                                    className="text-primary focus:ring-primary"
                                />
                                <div className="flex items-center space-x-1">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                    i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                    {rating}.0 & up
                  </span>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>


            {/* Popular Tags */}
            <div className="bg-card rounded-lg p-6">
                <button
                    onClick={() => toggleSection('tags')}
                    className="flex items-center justify-between w-full mb-4"
                >
                    <h3 className="text-lg font-semibold">Popular Tag</h3>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.tags ? 'rotate-180' : ''}`} />
                </button>

                {expandedSections.tags && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <button
                                key={index}
                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                    tag === 'Vegetarian'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Discount Banner */}
            <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 rounded-lg relative overflow-hidden">
                <div className="absolute right-4 top-4 text-4xl opacity-30">🥕</div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">79% Discount</h3>
                    <p className="text-sm mb-4 opacity-90">on your first order</p>
                    <button className="bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                        Shop now →
                    </button>
                </div>
            </div>

            {/* Sale Products */}
            {saleProducts.length > 0 && (
                <div className="bg-card rounded-lg p-6">
                    <button
                        onClick={() => toggleSection('sale')}
                        className="flex items-center justify-between w-full mb-4"
                    >
                        <h3 className="text-lg font-semibold">Sale Products</h3>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.sale ? 'rotate-180' : ''}`} />
                    </button>

                    {expandedSections.sale && (
                        <div className="space-y-4">
                            {saleProducts.map((product, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                                    <div className="text-3xl">{product.image}</div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-foreground">{product.name}</h4>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-sm font-semibold text-primary">${product.price}</span>
                                            {product.originalPrice && (
                                                <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3 h-3 ${
                                                        i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
    if (isMobile) {
        return (
            <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
                <div className="min-h-full">
                    {sidebarContent}
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 flex-shrink-0">
            {sidebarContent}
        </div>
    );
};
export default Sidebar