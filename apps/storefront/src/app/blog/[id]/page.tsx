"use client"
import React, { useState } from 'react';
import { Search, Calendar, User, MessageSquare, Share2, Facebook, Twitter,  ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Textarea } from '@/src/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import {Category} from "@/src/lib/types.ts";
import BreadCrumbs from "@/src/components/common/BreadCrumbs.tsx";
import Image from "next/image"

const SingleBlogPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const categories:Category[] = [
        { name: 'Fresh Fruit', count: 134 },
        { name: 'Vegetables', count: 150 },
        { name: 'Cooking', count: 54 },
        { name: 'Snacks', count: 47 },
        { name: 'Beverages', count: 43 },
        { name: 'Beauty & Health', count: 38 },
        { name: 'Bread & Bakery', count: 15 }
    ];

    const tags = ['Healthy', 'Low fat', 'Vegetarian', 'Bread', 'Kid foods', 'Vitamins', 'Snacks', 'Tiffin', 'Meat', 'Launch', 'Dinner'];

    const gallery = [
        'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1581006652062-a3c9e1b8e936?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1587486937413-0175e2f5a1f4?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=100&h=100&fit=crop'
    ];

    const recentPosts = [
        {
            title: 'Curabitur porttitor orci eget neque accumsan.',
            image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=80&h=80&fit=crop',
            date: 'Apr 25, 2021'
        },
        {
            title: 'Donec mattis arcu faucibus suscipit viverra.',
            image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=80&h=80&fit=crop',
            date: 'Apr 25, 2021'
        },
        {
            title: 'Quisque posuere tempus rutrum. Integer velit ex.',
            image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&h=80&fit=crop',
            date: 'Apr 25, 2021'
        }
    ];

    const comments = [
        {
            author: 'Annette Black',
            date: '26 Apr, 2021',
            avatar: 'https://i.pravatar.cc/150?img=1',
            text: 'Quisque nec consectetur diam. Maecenas malesuada erat sed facilisis ultrices. Phasellus pulvinar commodo mauris, et lacinia turpis consectetur eget. Nunc laoreet urna sed ex viverra, non convallis justo elementum.'
        },
        {
            author: 'Devon Lane',
            date: '24 Apr, 2021',
            avatar: 'https://i.pravatar.cc/150?img=2',
            text: 'Sed velit ligula, facilisis et facilisis nec, elementum sed velit. Morbi sollicitudin nibh ac mauris egestas bibendum facilisis eu lacus. Nunc interdum eros malesuada nisi facilisis varius vitae non dolor.'
        },
        {
            author: 'Jacob Jones',
            date: '24 Apr, 2021',
            avatar: 'https://i.pravatar.cc/150?img=3',
            text: 'Quisque sollicitudin mi ut efficitur vehicula. Nam ut ultrices eros posuere turpis justo purus.'
        },
        {
            author: 'Jane Cooper',
            date: '24 Apr, 2021',
            avatar: 'https://i.pravatar.cc/150?img=4',
            text: 'Integer scelerisque, odio vel bibendum sodales, quam erat fermentum nisi, nec finibus eros ante tempor mauris. Sed tempor facilisis orci vel varius. Sed cursus mattis urna, ultricies varius ipsum luctus at. Pellentesque pharetra tincidunt varius.'
        },
        {
            author: 'Robert Fox',
            date: '24 Apr, 2021',
            avatar: 'https://i.pravatar.cc/150?img=5',
            text: 'Aliquam laoreet ultricies'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative h-48 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=300&fit=crop)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <BreadCrumbs items={[{ label: 'Single Blog Page' }]} />
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Featured Image */}
                        <div className="mb-8 relative aspect-[16/10] w-full">
                            <Image
                                src="https://images.unsplash.com/photo-1547514701-42782101795e?w=800&h=500&fit=crop"
                                alt="Blog post"
                                fill
                                sizes="(max-width: 768px) 100vw, 800px"
                                className="rounded-2xl object-cover"
                            />
                        </div>

                        {/* Post Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                            <Badge variant="secondary" className="text-xs">Food</Badge>
                            <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                By Admin
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                65 Comments
                            </span>
                        </div>

                        {/* Post Title */}
                        <h1 className="text-3xl md:text-4xl font-bold mb-6">
                            Maecenas tempor urna sed quam mollis, a placerat dui fringilla. Dapibus.
                        </h1>

                        {/* Author Info */}
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src="https://i.pravatar.cc/150?img=10" />
                                <AvatarFallback>CW</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">Cameron Williamson</p>
                                <p className="text-sm text-muted-foreground">4 April, 2021 • 6 min read</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" className="rounded-full w-9 h-9">
                                    <Share2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="outline" className="rounded-full w-9 h-9 text-blue-600 hover:text-blue-600">
                                    <Facebook className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="outline" className="rounded-full w-9 h-9 text-sky-500 hover:text-sky-500">
                                    <Twitter className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="outline" className="rounded-full w-9 h-9 text-red-600 hover:text-red-600">
                                    <Facebook className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="prose prose-lg max-w-none mb-8">
                            <p className="text-muted-foreground mb-6">
                                Maecenas lacinia felis nec placerat sollicitudin. Quisque placerat dolor at scelerisque imperdiet. Phasellus tristique felis dolor.
                            </p>
                            <p className="text-muted-foreground mb-6">
                                Maecenas elementum in risus sed condimentum. Duis convallis ante ac tempus maximus. Fusce malesuada sed lectus in tristique. Nullam dictum vel libero vitae porttitor. Fusce semper lorem ipsum, quis molestie purus egestas non. In augue justo, venenatis in magna quis, vestibulum luctus eros.
                            </p>

                            <p className="text-muted-foreground mb-6">
                                Mauris pretium elit et ex pulvinar, at ornare ipsum adipiscing. Nullam interdum eget orci ornare adipiscing. Aliquam sollicitudin felis a mi vehicula dictum. Sed molestie, ligula at molestie ultrices, tellus ligula egestas nisi, et feugiat orci ornare vel diam. Sed imperdiet lectus at ornare adipiscing.
                            </p>
                        </div>

                        {/* Image Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="relative aspect-[4/3] w-full">
                                <Image
                                    src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop"
                                    alt="Oranges"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className="rounded-xl object-cover"
                                />
                            </div>
                            <div className="relative aspect-[4/3] w-full">
                                <Image
                                    src="https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop"
                                    alt="Mango"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className="rounded-xl object-cover"
                                />
                            </div>
                        </div>

                        <div className="prose prose-lg max-w-none mb-8">
                            <p className="text-muted-foreground mb-6">
                                Sed lobortis nunc rutrum ante imperdiet. Duis sit libero vestibulum non rutrum lorem semper velit lorem lorem ullamcorper mus at quisque eget aliquam dolor elit proin at. Suspendisse elementum semper eros, quis vehicula mauris. Sed feugiat faucibus odio. Vivamus in erat non enim scelerisque hendrerit nec in ligula. Cras non ante sed nibh hendrerit imperdiet vel id mauris.
                            </p>

                            <p className="text-muted-foreground mb-6">
                                Mauris pretium elit et ex pulvinar, at ornare ipsum adipiscing. Nullam interdum eget orci ornare adipiscing. Aliquam sollicitudin felis a mi vehicula dictum. Sed molestie, ligula at molestie ultrices, tellus ligula egestas nisi, et feugiat orci ornare vel diam. Sed imperdiet lectus at ornare adipiscing.
                            </p>
                        </div>

                        {/* Banner Ad */}
                        <Card className="bg-gray-900 text-white mb-12 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between p-8" style={{
                                    backgroundImage: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=200&fit=crop)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}>
                                    <div className="bg-black/60 p-8 rounded-2xl backdrop-blur-sm">
                                        <p className="text-primary text-sm font-semibold mb-2">SUMMER SALES</p>
                                        <h3 className="text-3xl font-bold mb-2">Fresh Fruit</h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-sm">Up to</span>
                                            <span className="text-5xl font-bold text-warning">56%</span>
                                            <span className="text-sm">off</span>
                                        </div>
                                        <Button className="bg-primary hover:bg-primary/90">
                                            Shop Now <ChevronRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Comments Section */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold mb-6">Comments</h2>
                            <div className="space-y-6">
                                {comments.map((comment, idx) => (
                                    <div key={idx} className="flex gap-4 pb-6 border-b last:border-0">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={comment.avatar} />
                                            <AvatarFallback>{comment.author[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-semibold">{comment.author}</h4>
                                                <span className="text-sm text-muted-foreground">{comment.date}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="mt-6">
                                Load More
                            </Button>
                        </div>

                        {/* Comment Form */}
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-2xl font-bold mb-6">Leave a Comment</h2>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                        <Input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <Textarea
                                        placeholder="Write your comment here..."
                                        rows={5}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="save-info" className="rounded" />
                                        <label htmlFor="save-info" className="text-sm text-muted-foreground">
                                            Save my name and email in this browser for the next time I comment.
                                        </label>
                                    </div>
                                    <Button className="bg-primary">
                                        Post Comment
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </main>

                    {/* Sidebar */}
                    <aside className="lg:w-80 space-y-6">
                        {/* Search */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Search..."
                                        className="pr-10"
                                    />
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Top Categories */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4">Top Categories</h3>
                                <div className="space-y-3">
                                    {categories.map((category) => (
                                        <div key={category.name} className="flex items-center justify-between text-sm hover:text-primary cursor-pointer transition-colors">
                                            <span>{category.name}</span>
                                            <span className="text-muted-foreground">({category.count})</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Popular Tag */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4">Popular Tag</h3>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant="secondary"
                                            className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors ${tag === 'Low fat' ? 'bg-primary text-primary-foreground' : ''}`}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Our Gallery */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4">Our Gallery</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {gallery.map((img, idx) => (
                                        <div key={idx} className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity relative">
                                            <Image
                                                src={img}
                                                alt={`Gallery ${idx + 1}`}
                                                fill
                                                sizes="(max-width: 768px) 50vw, 100px"
                                                className="object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recently Added */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4">Recently Added</h3>
                                <div className="space-y-4">
                                    {recentPosts.map((post, idx) => (
                                        <div key={idx} className="flex gap-3 group cursor-pointer">
                                            <div className="relative w-20 h-20 flex-shrink-0">
                                                <Image
                                                    src={post.image}
                                                    alt={post.title}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover rounded-lg"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors mb-1">
                                                    {post.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {post.date}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );

};

export default SingleBlogPage;