import { log } from "@repo/logger";
import Hero from "@/src/components/home/Hero.tsx";
import FeaturesSection from "@/src/components/home/FeaturesSection.tsx";
import PopularCategories from "@/src/components/home/PopularCategories.tsx";
import PopularProducts from "@/src/components/home/PopularProducts.tsx";
import PromotionalBanners from "@/src/components/home/PromotionalBanners.tsx";
import HotDeals from "@/src/components/home/HotDeals.tsx";
import NewsLetter from "@/src/components/home/NewsLetter.tsx";
import Testimonials from "@/src/components/home/Testimonials.tsx";
import LatestNews from "@/src/components/home/LatestNews.tsx";


export const metadata = {
  title: "Store | Kitchen Sink",
};

export default function Store() {
  log("Hey! This is the Store page.");

    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <FeaturesSection/>
            <PopularCategories />
            <PopularProducts/>
            <PromotionalBanners/>
            <HotDeals/>
            <NewsLetter/>
            <Testimonials/>
            <LatestNews/>
        </div>
  );
}
