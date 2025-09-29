
import { Leaf, Headphones, Package, ShoppingBag, Lock, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import BreadCrumbs from "@/src/components/common/BreadCrumbs.tsx";
import Image from "next/image"

const AboutPage = () => {
    const features = [
        {
            icon: <Leaf className="w-8 h-8" />,
            title: '100% Organic food',
            description: '100% healthy & Fresh food.'
        },
        {
            icon: <Headphones className="w-8 h-8" />,
            title: 'Great Support 24/7',
            description: 'Instant access to Contact'
        },
        {
            icon: <Star className="w-8 h-8" />,
            title: 'Customer Feedback',
            description: 'Our happy customer'
        },
        {
            icon: <Lock className="w-8 h-8" />,
            title: '100% Secure Payment',
            description: 'We ensure your money is save'
        },
        {
            icon: <Package className="w-8 h-8" />,
            title: 'Free Shipping',
            description: 'Free shipping with discount'
        },
        {
            icon: <ShoppingBag className="w-8 h-8" />,
            title: '100% Organic Food',
            description: '100% healthy & Fresh food.'
        }
    ];

    const teamMembers = [
        {
            name: 'Jenny Wilson',
            role: 'CEO & Founder',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
            social: { facebook: '#', twitter: '#', pinterest: '#', instagram: '#' }
        },
        {
            name: 'Jane Cooper',
            role: 'Worker',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
            social: { facebook: '#', twitter: '#', pinterest: '#', instagram: '#' }
        },
        {
            name: 'Cody Fisher',
            role: 'Security Guard',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
            social: { facebook: '#', twitter: '#', pinterest: '#', instagram: '#' }
        },
        {
            name: 'Robert Fox',
            role: 'Senior Farmer Manager',
            image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop',
            social: { facebook: '#', twitter: '#', pinterest: '#', instagram: '#' }
        }
    ];

    const testimonials = [
        {
            name: 'Robert Fox',
            role: 'Customer',
            image: 'https://i.pravatar.cc/150?img=1',
            rating: 5,
            text: 'Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. Donec sed neque eget'
        },
        {
            name: 'Dianne Russell',
            role: 'Customer',
            image: 'https://i.pravatar.cc/150?img=2',
            rating: 5,
            text: 'Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. Donec sed neque eget'
        },
        {
            name: 'Eleanor Pena',
            role: 'Customer',
            image: 'https://i.pravatar.cc/150?img=3',
            rating: 5,
            text: 'Pellentesque eu nibh eget mauris congue mattis mattis nec tellus. Phasellus imperdiet elit eu magna dictum, bibendum cursus velit sodales. Donec sed neque eget'
        }
    ];

    const brands = [
        { name: 'steps', logo: 'https://via.placeholder.com/120x40/f0f0f0/999999?text=steps' },
        { name: 'mango', logo: 'https://via.placeholder.com/120x40/f0f0f0/999999?text=mango' },
        { name: 'food', logo: 'https://via.placeholder.com/120x40/f0f0f0/999999?text=food' },
        { name: 'FOOD', logo: 'https://via.placeholder.com/120x40/f0f0f0/999999?text=FOOD' },
        { name: 'book-off', logo: 'https://via.placeholder.com/120x40/f0f0f0/999999?text=book-off' },
        { name: 'G Series', logo: 'https://via.placeholder.com/120x40/f0f0f0/999999?text=G+Series' }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative h-48 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900">
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=300&fit=crop"
                        alt="Hero background"
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                    />
                </div>
                <BreadCrumbs items={[{ label: 'about' }]} />
            </div>

            {/* First Section - 100% Trusted Organic Food Store */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-6">
                            100% Trusted<br />Organic Food Store
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Morbi porttitor ligula in nunc varius sagittis. Proin dui nisi, laoreet ut tempor ac, cursus vitae eros. Cras quis neque at tellus facilisis tempus. Maecenas aliquet vel tellus at accumsan. Donec a eros non massa vulputate ornare. Vivamus ornare lorem sit amet mauris sagittis hendrerit. Vestibulum volutpat ornare tortor, ac tincidunt leo viverra quis. Aliquam nec lacinia velit. Sed ullamcorper enim quis diam facilisis laoreet. Vivamus ac mauris nec ante dignissim facilisis at id duis vitae, commodo felis ante.
                        </p>
                    </div>
                    <div className="relative aspect-[3/2]">
                        <Image
                            src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&h=400&fit=crop"
                            alt="Farmer with produce"
                            fill
                            className="rounded-2xl object-cover"
                            sizes="(max-width: 1024px) 100vw, 600px"
                        />
                    </div>
                </div>
            </section>

            {/* Second Section - 100% Trusted with Features */}
            <section className="bg-muted/30 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                        <div className="relative aspect-square">
                            <Image
                                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=600&fit=crop"
                                alt="Farmer in field"
                                fill
                                className="rounded-2xl object-cover"
                                sizes="(max-width: 1024px) 100vw, 600px"
                            />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold mb-6">
                                100% Trusted<br />Organic Food Store
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Pellentesque a ante vulputate leo porttitor luctus sed eget eros. Nulla et rhoncus neque. Duis non diam eget est luctus tincidunt a a mi. Nulla eu eros consequat tortor tincidunt feugiat.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Delivery Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl font-bold mb-6">
                            We Delivered, You<br />Enjoy Your Order.
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Ut suscipit egestas suscipit. Sed posuere pellentesque nunc, ultrices consectetur velit dapibus eu. Mauris sollicitudin dignissim diam, ac mattis eros accumsan rhoncus. Curabitur auctor bibendum nunc eget elementum.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                Sed in metus pellentesque.
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                Fusce et ex commodo, aliquam nulla efficitur, tempus lorem.
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                Maecenas ut nunc fringilla erat varius.
                            </li>
                        </ul>
                        <Button className="bg-primary">
                            Shop Now <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                    <div className="relative aspect-square">
                        <Image
                            src="https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&h=600&fit=crop"
                            alt="Delivery person"
                            fill
                            className="rounded-2xl object-cover"
                            sizes="(max-width: 1024px) 100vw, 600px"
                        />
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="bg-muted/30 py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Our Awesome Team</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Pellentesque a ante vulputate leo porttitor luctus sed eget eros. Nulla et rhoncus neque. Duis non diam eget est luctus tincidunt a a mi.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {teamMembers.map((member, idx) => (
                                <Card key={idx} className="overflow-hidden group">
                                    <CardContent className="p-0">
                                        <div className="relative overflow-hidden aspect-[3/4]">
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                                sizes="(max-width: 1024px) 100vw, 300px"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                    <Button size="icon" variant="secondary" className="rounded-full w-8 h-8">
                                                        <span className="sr-only">Facebook</span>
                                                        f
                                                    </Button>
                                                    <Button size="icon" variant="secondary" className="rounded-full w-8 h-8">
                                                        <span className="sr-only">Twitter</span>
                                                        t
                                                    </Button>
                                                    <Button size="icon" variant="secondary" className="rounded-full w-8 h-8">
                                                        <span className="sr-only">Pinterest</span>
                                                        p
                                                    </Button>
                                                    <Button size="icon" variant="secondary" className="rounded-full w-8 h-8">
                                                        <span className="sr-only">Instagram</span>
                                                        i
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 text-center">
                                            <h3 className="font-bold mb-1">{member.name}</h3>
                                            <p className="text-sm text-muted-foreground">{member.role}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <Button
                            size="icon"
                            variant="outline"
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white dark:bg-gray-800 shadow-lg"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="outline"
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white dark:bg-gray-800 shadow-lg"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">Client Testimonial</h2>
                </div>
                <div className="relative max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, idx) => (
                            <Card key={idx} className="relative">
                                <CardContent className="p-6">
                                    <div className="text-6xl text-muted-foreground/20 mb-4">"</div>
                                    <p className="text-sm text-muted-foreground mb-6">{testimonial.text}</p>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={testimonial.image} />
                                            <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold">{testimonial.name}</h4>
                                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 mt-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-center gap-2 mt-8">
                        <Button size="icon" className="rounded-full bg-primary">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button size="icon" className="rounded-full bg-primary">
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Brands Section */}
            <section className="border-t py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
                        {brands.map((brand, idx) => (
                            <div key={idx} className="grayscale hover:grayscale-0 transition-all relative h-10 w-28">
                                <Image
                                    src={brand.logo}
                                    alt={brand.name}
                                    fill
                                    className="object-contain"
                                    sizes="120px"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );

};

export default AboutPage;