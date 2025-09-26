'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Facebook, Twitter, Instagram, X } from 'lucide-react';
import Link from 'next/link'


export const Newsletter = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Newsletter subscription:', email);
        setEmail('');
    };

    return (

        <section className="bg-muted py-12 mx-auto ">
            <div className="container mx-auto px-4">
                <div className="max-w-md">
                    <h2 className="text-2xl font-bold text-foreground mb-2">Subscribe our Newsletter</h2>
                    <p className="text-muted-foreground mb-6">
                        Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales.
                    </p>

                <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
                    <div className="flex">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                         required
                        />
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </form>

                <div className="flex justify-center space-x-4">
                    <Link
                        href="#"
                        className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                        <Facebook className="w-5 h-5" />
                    </Link>
                    <Link
                        href="#"
                        className="w-10 h-10 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                        <Twitter className="w-5 h-5" />
                    </Link>
                    <Link
                        href="#"
                        className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                        <X className="w-5 h-5" />
                    </Link>
                    <Link
                        href="#"
                        className="w-10 h-10 bg-pink-600 hover:bg-pink-700 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                        <Instagram className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
        </section>
    );
};
