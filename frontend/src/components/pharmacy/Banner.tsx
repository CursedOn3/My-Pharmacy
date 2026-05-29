import { ArrowRight } from "lucide-react";
import { MarketingBanner } from "@/lib/api";

interface BannerProps {
  banner: MarketingBanner;
  actionButton?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
}

const Banner = ({ banner, actionButton }: BannerProps) => {
  if (!banner) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-mint rounded-[2rem] p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center relative overflow-hidden">
        <div className="space-y-5">
          {banner.title && (
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-primary-deep">
              {banner.title}
            </h2>
          )}
          {banner.description && (
            <p className="text-primary-deep/70 text-sm">
              {banner.description}
            </p>
          )}
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="inline-flex items-center gap-2 bg-primary-deep text-primary-deep-foreground px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {actionButton.text} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
        {banner.image_url && (
          <div className="relative">
            <img
              src={banner.image_url}
              alt={banner.title}
              loading="lazy"
              width={768}
              height={768}
              className="rounded-3xl w-full max-w-md mx-auto"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Banner;
