'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";




const Testimonials = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const testimonials = [
        {
            name: "Robert Fox",
            rating: 5,
            text: "Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. The quality of products is exceptional and delivery is always on time.",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
            position: "Marketing Manager",
            company: "Tech Solutions Inc."
        },
        {
            name: "Dianne Russell",
            rating: 5,
            text: "Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. I've been a loyal customer for over 2 years now.",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
            position: "Food Blogger",
            company: "Healthy Living Blog"
        },
        {
            name: "Eleanor Pena",
            rating: 5,
            text: "Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. The organic selection is amazing and prices are very competitive.",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
            position: "Chef",
            company: "Green Kitchen Restaurant"
        }
    ];


    // autoplaying functionality
    // Auto-play functionality
    useEffect(() => {
        if (isAutoPlaying) {
            const interval = setInterval(() => {
                setCurrentTestimonial(prev =>
                    prev < testimonials.length - 1 ? prev + 1 : 0
                );
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isAutoPlaying, testimonials.length]);
    const goToPrevious = () => {
        setIsAutoPlaying(false);
        setCurrentTestimonial(currentTestimonial > 0 ? currentTestimonial - 1 : testimonials.length - 1);
    };

    const goToNext = () => {
        setIsAutoPlaying(false);
        setCurrentTestimonial(currentTestimonial < testimonials.length - 1 ? currentTestimonial + 1 : 0);
    };

    const goToTestimonial = (index) => {
        setIsAutoPlaying(false);
        setCurrentTestimonial(index);
    };

    return (
     <section className="py-16 ;g:py-20 ng-gray-50 dark:bng-gray-900 transition-colors duration-300 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute inset-0 opacity-5 dark:opacity-10">
             <div className="absolute top-10 left-10 w-20 h-20 bg-green-500 rounded-full"></div>
             <div className="absolute top-32 right-20 w-16 h-16 bg-yellow-400 rounded-full"></div>
             <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-500 rounded-full"></div>
             <div className="absolute bottom-32 right-10 w-24 h-24 bg-pink-400 rounded-full"></div>
         </div>

         <div className="container mx-auto px-4 relative z-10">
         {/*    Header */}
             <div className="text-center mb-12 lg:mb-16">
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                     What Our Customers Say
                 </h2>
                 <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                     Don't take our word for it. Here's what our satisfied customers have to say about their experience.
                 </p>
             </div>

         {/*    Main Testimonial Card */}
             <div className="max-2-5xl mx-autop">
                 <div className="bg-white dark:bg-800 rounded-2xl lg:rounded-3xl p-8 lg:p-12 shadow-xl dark:shadow-gray-900/20 relative">

                     {/* Quote Icon */}
                     <div className="absolute top-6 left-6 lg:top-8 lg:left-8">
                         <Quote className="w-8 h-8 lg:w-12 lg:h-12 text-green-500/20 dark:text-green-400/20" />
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                         {/* Navigation Buttons */}
                         <div className="hidden lg:flex lg:col-span-1 justify-center">
                             <button
                                 onClick={goToPrevious}
                                 className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                                 aria-label="Previous testimonial"
                             >
                                 <ChevronLeft className="w-6 h-6" />
                             </button>
                         </div>

                     {/*    Content */}

<div className="lg:col-span-10">
    <div className="text-center">
        {/* User Avatar */}
        <div className="relative w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6 lg:mb-8">
            {/* Placeholder for when you don't have actual images yet */}
            {/*<div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl lg:text-4xl font-bold">*/}
            {/*    {testimonials[currentTestimonial].name.charAt(0)}*/}
            {/*</div>*/}
            {/* Uncomment when you have actual images */}
            <Image
                                            src={testimonials[currentTestimonial].avatar}
                                            alt={testimonials[currentTestimonial].name}
                                            fill
                                            className="object-cover rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                                        />
        </div>

        {/* Rating Stars */}
        <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-5 h-5 lg:w-6 lg:h-6 ${
                        i < testimonials[currentTestimonial].rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                    }`}
                />
            ))}
        </div>
        {/* Testimonial Text */}
        <blockquote className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed italic max-w-3xl mx-auto">
            "{testimonials[currentTestimonial].text}"
        </blockquote>

        {/* User Info */}
        <div className="space-y-2">
            <h4 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
                {testimonials[currentTestimonial].name}
            </h4>
            <p className="text-green-600 dark:text-green-400 font-medium">
                {testimonials[currentTestimonial].position}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                {testimonials[currentTestimonial].company}
            </p>
        </div>
    </div>
</div>
                         {/* Navigation Buttons */}
                         <div className="hidden lg:flex lg:col-span-1 justify-center">
                             <button
                                 onClick={goToNext}
                                 className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                                 aria-label="Next testimonial"
                             >
                                 <ChevronRight className="w-6 h-6" />
                             </button>
                         </div>
                     </div>

                     {/* Mobile Navigation */}
                     <div className="flex lg:hidden justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                         <button
                             onClick={goToPrevious}
                             className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 rounded-full flex items-center justify-center transition-all duration-300"
                         >
                             <ChevronLeft className="w-5 h-5" />
                         </button>

                         {/* Dots Indicator */}
                         <div className="flex space-x-2">
                             {testimonials.map((_, index) => (
                                 <button
                                     key={index}
                                     className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                         currentTestimonial === index
                                             ? 'bg-green-600 dark:bg-green-500 scale-125'
                                             : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                     }`}
                                     onClick={() => goToTestimonial(index)}
                                     aria-label={`Go to testimonial ${index + 1}`}
                                 />
                             ))}
                         </div>

                         <button
                             onClick={goToNext}
                             className="w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 rounded-full flex items-center justify-center transition-all duration-300"
                         >
                             <ChevronRight className="w-5 h-5" />
                         </button>
                     </div>
                 </div>

                 {/* Desktop Dots Indicator */}
                 <div className="hidden lg:flex justify-center space-x-3 mt-8">
                     {testimonials.map((_, index) => (
                         <button
                             key={index}
                             className={`w-4 h-4 rounded-full transition-all duration-300 ${
                                 currentTestimonial === index
                                     ? 'bg-green-600 dark:bg-green-500 scale-125'
                                     : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                             }`}
                             onClick={() => goToTestimonial(index)}
                             aria-label={`Go to testimonial ${index + 1}`}
                         />
                     ))}
                 </div>

                 {/* Auto-play Toggle */}
                 <div className="text-center mt-6">
                     <button
                         onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                         className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                     >
                         {isAutoPlaying ? 'Pause Auto-play' : 'Resume Auto-play'}
                     </button>
                 </div>
             </div>
         </div>
     </section>
    );
};


export default Testimonials;