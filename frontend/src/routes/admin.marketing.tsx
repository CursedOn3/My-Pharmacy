import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BadgePercent, Megaphone, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/marketing")({
  component: AdminMarketingPage,
  head: () => ({
    meta: [{ title: "Discounts & Banners — Admin" }],
  }),
});

type DiscountRule = {
  id: string;
  productId: string;
  percent: number;
  active: boolean;
};

type Banner = {
  id: string;
  title: string;
  placement: "home" | "products" | "checkout";
  active: boolean;
};

const STORAGE = {
  discounts: "medicare.admin.discounts.v1",
  banners: "medicare.admin.banners.v1",
} as const;

const safeRead = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
};

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function AdminMarketingPage() {
  const { inventory } = useStore();
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  const [productId, setProductId] = useState("");
  const [percent, setPercent] = useState("10");
  const [bannerTitle, setBannerTitle] = useState("");
  const [placement, setPlacement] = useState<Banner["placement"]>("home");

  useEffect(() => {
    setDiscounts(safeRead<DiscountRule[]>(STORAGE.discounts, []));
    setBanners(safeRead<Banner[]>(STORAGE.banners, []));
  }, []);

  useEffect(() => {
    safeWrite(STORAGE.discounts, discounts);
  }, [discounts]);

  useEffect(() => {
    safeWrite(STORAGE.banners, banners);
  }, [banners]);

  const productById = useMemo(
    () => new Map(inventory.map((item) => [item.id, item])),
    [inventory],
  );

  const activeDiscounts = discounts.filter((d) => d.active).length;
  const activeBanners = banners.filter((b) => b.active).length;

  const addDiscount = () => {
    const pct = Number(percent);
    if (!productId) {
      toast.error("Select a product first");
      return;
    }
    if (!Number.isFinite(pct) || pct < 1 || pct > 90) {
      toast.error("Discount must be between 1% and 90%");
      return;
    }
    setDiscounts((prev) => [
      {
        id: newId("disc"),
        productId,
        percent: Math.round(pct),
        active: true,
      },
      ...prev,
    ]);
    toast.success("Discount rule added");
  };

  const addBanner = () => {
    const text = bannerTitle.trim();
    if (text.length < 3) {
      toast.error("Banner title is too short");
      return;
    }
    setBanners((prev) => [
      {
        id: newId("bnr"),
        title: text.slice(0, 80),
        placement,
        active: true,
      },
      ...prev,
    ]);
    setBannerTitle("");
    toast.success("Banner added");
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={BadgePercent} label="Discount rules" value={discounts.length} bg="bg-mint" />
        <Stat icon={BadgePercent} label="Active discounts" value={activeDiscounts} bg="bg-sun" />
        <Stat icon={Megaphone} label="Banners" value={banners.length} bg="bg-peach" />
        <Stat icon={Megaphone} label="Active banners" value={activeBanners} bg="bg-rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="bg-card border border-border rounded-3xl p-5 shadow-card space-y-4">
          <h2 className="font-display text-lg font-extrabold text-primary-deep">
            Product discounts
          </h2>
          <div className="grid sm:grid-cols-[1fr_100px_auto] gap-2">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="bg-muted rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="">Select product</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              type="number"
              min={1}
              max={90}
              className="bg-muted rounded-xl px-3 py-2 text-sm outline-none"
              placeholder="% off"
            />
            <button
              type="button"
              onClick={addDiscount}
              className="inline-flex items-center justify-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-full text-xs font-semibold hover:scale-[1.02] transition-transform"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2">
            {discounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No discount rules yet.</p>
            ) : (
              discounts.map((rule) => {
                const product = productById.get(rule.productId);
                return (
                  <div
                    key={rule.id}
                    className="rounded-2xl border border-border bg-background p-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary-deep truncate">
                        {product?.name ?? "Removed product"}
                      </p>
                      <p className="text-xs text-muted-foreground">{rule.percent}% off</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDiscounts((prev) =>
                          prev.map((d) =>
                            d.id === rule.id ? { ...d, active: !d.active } : d,
                          ),
                        )
                      }
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        rule.active
                          ? "bg-mint text-primary-deep"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {rule.active ? "Active" : "Paused"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDiscounts((prev) => prev.filter((d) => d.id !== rule.id))
                      }
                      className="h-8 w-8 rounded-full inline-flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20"
                      aria-label="Delete discount rule"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="bg-card border border-border rounded-3xl p-5 shadow-card space-y-4">
          <h2 className="font-display text-lg font-extrabold text-primary-deep">
            Promo banners
          </h2>
          <div className="grid sm:grid-cols-[1fr_140px_auto] gap-2">
            <input
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              maxLength={80}
              className="bg-muted rounded-xl px-3 py-2 text-sm outline-none"
              placeholder="e.g. Summer wellness sale up to 25% off"
            />
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as Banner["placement"])}
              className="bg-muted rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value="home">Home</option>
              <option value="products">Products</option>
              <option value="checkout">Checkout</option>
            </select>
            <button
              type="button"
              onClick={addBanner}
              className="inline-flex items-center justify-center gap-1.5 bg-primary-deep text-primary-deep-foreground px-4 py-2 rounded-full text-xs font-semibold hover:scale-[1.02] transition-transform"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2">
            {banners.length === 0 ? (
              <p className="text-sm text-muted-foreground">No banners created yet.</p>
            ) : (
              banners.map((banner) => (
                <div
                  key={banner.id}
                  className="rounded-2xl border border-border bg-background p-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary-deep truncate">
                      {banner.title}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Placement: {banner.placement}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setBanners((prev) =>
                        prev.map((b) =>
                          b.id === banner.id ? { ...b, active: !b.active } : b,
                        ),
                      )
                    }
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      banner.active
                        ? "bg-mint text-primary-deep"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {banner.active ? "Active" : "Paused"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBanners((prev) => prev.filter((b) => b.id !== banner.id))
                    }
                    className="h-8 w-8 rounded-full inline-flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20"
                    aria-label="Delete banner"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 space-y-2`}>
      <div className="h-9 w-9 rounded-xl bg-background/70 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary-deep" />
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-primary-deep/70">
        {label}
      </div>
      <div className="font-display text-2xl font-extrabold text-primary-deep">
        {value}
      </div>
    </div>
  );
}
