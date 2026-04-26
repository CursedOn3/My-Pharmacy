import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/context/StoreContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { Toaster } from "@/components/ui/sonner";
import ProductModal from "@/components/pharmacy/ProductModal";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary-deep">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary-deep px-5 py-2.5 text-sm font-semibold text-primary-deep-foreground transition-transform hover:scale-105"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Medicare Pharmacy — 2-hour delivery" },
      { name: "description", content: "Trusted online pharmacy with prescription upload, 2-hour delivery, and licensed pharmacists." },
      { name: "author", content: "Medicare" },
      { property: "og:title", content: "Medicare Pharmacy" },
      { property: "og:description", content: "Trusted online pharmacy with 2-hour delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <StoreProvider>
        <FavoritesProvider>
          <CartProvider>
            <Outlet />
            <ProductModal />
            <Toaster />
          </CartProvider>
        </FavoritesProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
