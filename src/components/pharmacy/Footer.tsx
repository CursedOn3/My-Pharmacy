import { Link } from "@tanstack/react-router";

const pageLinks: Record<string, "/about" | "/contact" | "/favorites" | "/orders" | "/products" | "/wishlist" | "/reorder-favorites"> = {
  "About Us": "/about",
  Contact: "/contact",
  Favorites: "/favorites",
  Orders: "/orders",
  Products: "/products",
  Wishlist: "/wishlist",
  "Reorder favorites": "/reorder-favorites",
  "Track order": "/orders",
};

const cols = [
  { title: "Shop", links: ["Products", "Vitamins", "Medicine", "Wellness", "Beauty", "Devices"] },
  { title: "Company", links: ["About Us", "Careers", "Press", "Partners", "Contact"] },
  { title: "Support", links: ["Favorites", "Wishlist", "Orders", "Reorder favorites", "Help center", "Track order", "Returns", "FAQ", "Shipping"] },
  { title: "Trust & Legal", links: ["Privacy", "Terms", "Pharmacy license", "Cookies", "Accessibility"] },
];

const Footer = () => {
  return (
    <footer className="container mx-auto px-4 pb-8">
      <div className="bg-cream rounded-3xl p-8 md:p-10 grid md:grid-cols-4 gap-6 mb-4">
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-display font-extrabold text-primary-deep mb-3">{c.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.links.map((l) => (
                <li key={l}>
                  {pageLinks[l] ? (
                    <Link to={pageLinks[l]} className="hover:text-primary-deep">
                      {l}
                    </Link>
                  ) : (
                    <span className="hover:text-primary-deep cursor-pointer">{l}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-deep rounded-3xl p-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center font-display font-extrabold text-primary-foreground text-lg">
            M
          </div>
          <span className="font-display text-5xl md:text-7xl font-extrabold text-primary-deep-foreground">
            Medicare
          </span>
        </div>
        <p className="text-primary-deep-foreground/60 text-xs">
          © 2026 Medicare Pharmacy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
