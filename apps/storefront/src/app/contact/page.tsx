"use client";

import React, { useState } from "react";
import { MapPin, Mail, Phone, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import dynamic from "next/dynamic";

// Dynamically import react-leaflet (avoids SSR issues)
const Map = dynamic(() => import("@/src/components/common/Map"), {
    ssr: false,
});

const ContactPage = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative h-48 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "url(https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=300&fit=crop)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <div className="relative container mx-auto px-4 h-full flex items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">Contact</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Home</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-primary">Contact</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="container mx-auto px-4 py-16">
                {/* Info cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <Card className="text-center">
                        <CardContent className="p-8">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                2715 Ash Dr. San Jose, South Dakota 83475
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="p-8">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-sm font-medium mb-1">Proxy@gmail.com</p>
                            <p className="text-sm text-muted-foreground">Help.proxy@gmail.com</p>
                        </CardContent>
                    </Card>

                    <Card className="text-center">
                        <CardContent className="p-8">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-sm font-medium mb-1">(219) 555-0114</p>
                            <p className="text-sm text-muted-foreground">(164) 333-0487</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Form + Map */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Form */}
                    <Card>
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-2">Just Say Hello!</h2>
                            <p className="text-muted-foreground mb-8">
                                Do you fancy saying hi to me or you want to get started with
                                your project and you need my help? Feel free to contact me.
                            </p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    name="subject"
                                    placeholder="Subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                />
                                <Textarea
                                    name="message"
                                    placeholder="Your Message"
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                                <Button type="submit" className="bg-primary w-full md:w-auto">
                                    Send Message
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Map */}
                    <div className="relative h-[400px] rounded-xl overflow-hidden">
                        <Map />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;



