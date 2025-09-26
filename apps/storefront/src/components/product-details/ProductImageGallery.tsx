"use client"

import {useState, useEffect, useRef} from "react";
import Image from "next/image";
import {ChevronLeft, ChevronRight} from "lucide-react";

interface ProductImageGalleryProps {
    images:string[];
    productName: string;

}

const ProductImageGallery = ({images, productName}: ProductImageGalleryProps) => {

    console.log(images)
    const [currentImage, setCurrentImage] = useState(0);
    const nextImage = () => {
        setCurrentImage((prev) => (prev + 1) % images.length);

    }


    const prevImage = () => {
        setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

    }

    return (
        <div className="psace-y-4">
            <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden group">

                <div className="aspect-square relative">

                    <Image
                        src={images[currentImage]}
                        alt={productName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority
                    />

                    {/* Navigation Arrows*/}

                    {images.length > 1 && (

                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>

                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            </button>
                        </>
                    )}

                    {/* Image Indicators */}

                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                            {images.map((_, index) => (
                                <button key={index} className={`w-2 h-2 rounded-full transition-colors duration-200 ${index === currentImage ? "bg-green-600" : ":bg-white/50 hover:bg-white/75"}`}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Thumb Nail*/}
            {images.length >  1 && (
                <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImage(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                                index === currentImage
                                    ? 'border-green-600'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-400'
                            }`}
                        >
                            <Image
                                src={image}
                                alt={`${productName} view ${index + 1}`}
                                fill
                                sizes="25vw"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProductImageGallery
