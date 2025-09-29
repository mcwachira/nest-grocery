"use client"
import React, { useState } from 'react';
import { Search, Calendar, User, MessageSquare, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import BreadCrumbs from "@/src/components/common/BreadCrumbs.tsx";
import Pagination from "@/src/components/common/Pagination.tsx";

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    date: string;
    author: string;
    comments: number;
    category: string;
}

const BlogListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const blogPosts: BlogPost[] = [
        {
            id: 1,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        },
        {
            id: 2,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        },
        {
            id: 3,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        },
        {
            id: 4,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        },
        {
            id: 5,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1587486937413-0175e2f5a1f4?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        },
        {
            id: 6,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        },
        {
            id: 7,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        },
        {
            id: 8,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        },
        {
            id: 9,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        },
        {
            id: 10,
            title: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            excerpt: 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.',
            image: 'https://images.unsplash.com/photo-1589927986089-35812378b9e2?w=400&h=300&fit=crop',
            date: 'Apr 25, 2021',
            author: 'Admin',
            comments: 65,
            category: 'Food'
        }
    ];

    const categories = [
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

    const blogsPerPage = 4;
    // Pagination
    const totalPages = Math.ceil(blogPosts.length / blogsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


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
                <BreadCrumbs items={[{ label: 'Blog' }]} />
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-80 space-y-6">
                        {/* Search */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                        <div key={idx} className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity">
                                            <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
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
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                            />
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

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Button size="sm" className="bg-primary">
                                    <Search className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Sort by:</span>
                                <select className="border rounded-lg px-3 py-1.5 bg-background">
                                    <option>Latest</option>
                                    <option>Oldest</option>
                                    <option>Popular</option>
                                </select>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">{blogPosts.length}</span> Results Found
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {blogPosts.map((post) => (
                                <Card key={post.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-center shadow-lg">
                                            <div className="text-2xl font-bold text-foreground">{post.date.split(' ')[1].replace(',', '')}</div>
                                            <div className="text-xs text-muted-foreground uppercase">{post.date.split(' ')[0]}</div>
                                        </div>
                                    </div>
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        By {post.author}
                      </span>
                                            <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                                                {post.comments} Comments
                      </span>
                                            <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {post.title}
                                        </h3>
                                        <Button variant="link" className="p-0 h-auto font-semibold text-primary">
                                            Read More <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BlogListPage;