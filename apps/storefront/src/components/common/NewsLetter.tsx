"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, X } from "lucide-react";

interface SocialLink {
    name: string;
    href: string;
    icon: React.ElementType;
    variant?: "solid" | "outline"; // to control style
}

interface NewsletterProps {
    title?: string;
    description?: string;
    placeholder?: string;
    showSocials?: boolean;
    socials?: SocialLink[];
    compact?: boolean; // toggle between compact (centered) and wide (row layout)
}

const Newsletter = ({
                        title = "Subscribe our Newsletter",
                        description = "Pellentesque eu nibh eget mauris congue mattis nec tellus. Phasellus imperdiet elit eu magna.",
                        placeholder = "Your email address",
                        showSocials = true,
                        compact = false,
                        socials = [
                            { name: "Facebook", href: "#", icon: Facebook, variant: "solid" },
                            { name: "Twitter", href: "#", icon: Twitter, variant: "solid" },
                            { name: "X", href: "#", icon: X, variant: "solid" },
                            { name: "Instagram", href: "#", icon: Instagram, variant: "solid" },
                        ],
                    }: NewsletterProps) => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        // Simulate API call
        setTimeout(() => {
            setMessage("Thank you for subscribing!");
            setEmail("");
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <section className="bg-muted py-12 px-4 mt-12">
            <div className="container mx-auto">
                <div
                    className={`flex flex-col ${
                        compact ? "items-center text-center" : "md:flex-row items-center justify-between"
                    } gap-8`}
                >
                    {/* Text Content */}
                    <div className={`flex-1 ${compact ? "max-w-xl mx-auto" : "max-w-md"}`}>
                        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
                        <p className="text-muted-foreground text-sm md:text-base">{description}</p>
                    </div>

                    {/* Form + Socials */}
                    <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="w-full md:w-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={placeholder}
                                    required
                                    className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground min-w-[240px]"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                                </button>
                            </div>
                            {message && <p className="text-sm text-primary mt-2">{message}</p>}
                        </form>

                        {/* Social Icons */}
                        {showSocials && (
                            <div className="flex flex-wrap justify-center md:justify-end gap-3">
                                {socials.map((social, idx) => {
                                    const Icon = social.icon;
                                    const baseClasses =
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors";
                                    const styles =
                                        social.variant === "solid"
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "border border-border text-muted-foreground hover:bg-muted";

                                    return (
                                        <Link
                                            key={idx}
                                            href={social.href}
                                            aria-label={social.name}
                                            className={`${baseClasses} ${styles}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
