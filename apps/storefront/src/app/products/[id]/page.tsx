"use client"


import  ProductImageGallery  from '@/src/components/product-details/ProductImageGallery';
import  ProductInfo  from '@/src/components/product-details/ProductInfo';
import  ProductTabs  from '@/src/components/product-details/ProductTabs';
import  RelatedProducts  from '@/src/components/product-details/RelatedProducts';
import  ValuePropositions  from '@/src/components/product-details/ValuePropositions';
import Newsletter from "@/src/components/common/NewsLetter.tsx";
import BreadCrumbs from "@/src/components/common/BreadCrumbs.tsx";
import ChineseCabbage from "@/src/assets/products/chinese-cabbage-bg.png"
import GreenCapsicum from "@/src/assets/products/green-capsicum-bg.png"
import Oranges from "@/src/assets/products/oranges-bg.png"
import GreenChilli from "@/src/assets/products/green-chilli-bg.png"
import GreenApples from "@/src/assets/products/green-apples-bg.png"
const mockProduct = {
    name: 'Chinese Cabbage',
    price: 17.28,
    originalPrice: 48.00,
    rating: 4.5,
    reviewCount: 4,
    sku: '2,51,594',
    brand: 'Nest Food',
    inStock: true,
    description: 'Class aptent taciti sociosqu ad litora torquent per conubia nostea, per inceptos himenaeos. Nulla nibh diam, blandit vel consequat nec, ultrices et ipsum. Nulla varius magna a consequat pulvinar.',
    category: 'Vegetables',
    tags: ['Vegetables', 'Healthy', 'Chinese', 'Cabbage', 'Green', 'Cabbage'],
        images: [ChineseCabbage.src, ChineseCabbage.src, ChineseCabbage.src, ChineseCabbage.src],

};

const mockAdditionalInfo = {
    weight: '2.5',
    color: 'Green',
    type: 'Organic',
    category: 'Vegetables',
    stockStatus: 'Available (5,413)',
    tags: 'Vegetables, Healthy, Chinese, Cabbage, Green, Cabbage'
};

const mockFeatures =  [
    '64 oz of fresh lettuce provides',
    'Aliquam ac est at augue volutpat elementum',
    'Quisque nec enim eget sapien molestie',
    'Proin convallis odio volutpat finibus posuere'
]
const mockReviews = [
    {
        id: 1,
        name: 'John Doe',
        rating: 5,
        date: 'March 15, 2024',
        comment: 'Excellent quality vegetables! Fresh and delivered on time. Will definitely order again.',
        verified: true
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        rating: 4,
        date: 'March 12, 2024',
        comment: 'Good product, fresh and organic as advertised. Packaging could be better.',
        verified: true
    },
    {
        id: 3,
        name: 'Mike Chen',
        rating: 5,
        date: 'March 10, 2024',
        comment: 'Love the freshness and quality. Perfect for my family meals.',
        verified: false
    }
]

const mockRelatedProducts =  [
    {
        id: 1,
        name: 'Green Apple',
        price: 14.99,
        originalPrice: 20.99,
        image: GreenApples.src,
        rating: 4.5,
        discount: 50
    },
    {
        id: 2,
        name: 'Green Chilli',
        price: 14.99,
        image: GreenChilli.src,
        rating: 4.0
    },
    {
        id: 3,
        name: 'Green Capsicum',
        price: 14.99,
        image: GreenCapsicum.src,
        rating: 4.5
    },
    {
        id: 4,
        name: 'Oranges',
        price: 14.99,
        image: Oranges.src,
        rating: 4.5
    }
]
const ProductDetailPage = () => {

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">

            {/* Breadcrumb */}
           <BreadCrumbs/>
            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Product Section */}
                <div className="grid lg:grid-cols-2 gap-12 mb-16">
                    {/* Product Images */}
                    <div>
                        <ProductImageGallery
                            images={mockProduct.images}
                            productName={mockProduct.name}
                        />
                    </div>

                    {/* Product Information */}
                    <div>
                        <ProductInfo product={mockProduct} />
                    </div>
                </div>

                {/* Value Propositions */}
                <ValuePropositions />

                {/* Product Tabs */}
                <ProductTabs
                    description={mockProduct.description}
                    additionalInfo={mockAdditionalInfo}
                    reviews={mockReviews}
                    features={mockFeatures}
                />

                {/* Related Products */}
                <RelatedProducts products={mockRelatedProducts} />
            </div>

            {/* Newsletter */}
            <Newsletter />
        </div>
    );
};

export default  ProductDetailPage