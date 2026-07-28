import ProductList from "@/components/ProductList";
import HeroSlider from "@/components/HeroSlider";
import XiaomiGrid from "@/components/XiaomiGrid";
import MagicalBackground from "@/components/MagicalBackground";
import HomePageIntroWrapper from "@/components/HomePageIntroWrapper";

const Homepage = async ({
  searchParams,
}: {
  searchParams: Promise<{ category: string }>;
}) => {
  const category = (await searchParams).category;
  return (
    <HomePageIntroWrapper>
      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-[-1]">
          <MagicalBackground />
        </div>
        <HeroSlider />
        <XiaomiGrid />
        <div className="relative z-10">
          <ProductList category={category} params="homepage" />
        </div>
      </div>
    </HomePageIntroWrapper>
  );
};

export default Homepage;
