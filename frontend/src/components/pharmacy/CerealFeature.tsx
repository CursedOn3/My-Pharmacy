import { useEffect, useState } from "react";
import { api, type MarketingBanner } from "@/lib/api";
import Banner from "./Banner";

const CerealFeature = () => {
  const [banner, setBanner] = useState<MarketingBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadBanner = async () => {
      try {
        const data = await api.getBannerByPlacement("home");
        if (active) setBanner(data);
      } catch (error) {
        console.error("Failed to load banner:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadBanner();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="bg-mint rounded-[2rem] p-8 md:p-12 h-64 flex items-center justify-center">
          <div className="text-primary-deep/50">Loading...</div>
        </div>
      </section>
    );
  }

  if (!banner) {
    return null;
  }

  return (
    <Banner
      banner={banner}
      actionButton={{
        text: "Learn more",
        onClick: () => window.scrollTo({ top: 0, behavior: "smooth" })
      }}
    />
  );
};

export default CerealFeature;
