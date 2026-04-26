import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, Heart, MapPin, User, Menu, LogOut, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isCustomer = user && user.role !== "admin";

  return (
    <header className="w-full border-b border-border bg-background sticky top-0 z-40">
      <div className="container mx-auto flex items-center gap-4 py-4 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-xl gradient-hero flex items-center justify-center font-display font-extrabold text-primary-foreground">
            M
          </div>
          <span className="font-display text-xl font-extrabold text-primary-deep">
            Medicare
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-full">
          <MapPin className="h-4 w-4 text-primary-deep" />
          <span className="font-medium text-primary-deep">Deliver to</span>
          <span>New York 10001</span>
        </div>

        <div className="flex-1 hidden lg:flex items-center bg-muted rounded-full px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search for medicines, health products & more..."
            className="bg-transparent flex-1 outline-none px-3 text-sm"
          />
          <button className="text-xs font-semibold bg-primary-deep text-primary-deep-foreground px-3 py-1.5 rounded-full">
            Search
          </button>
        </div>

        <nav className="ml-auto flex items-center gap-1">
          {user && user.role !== "admin" && (
            <Link
              to="/prescription"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold bg-mint text-primary-deep px-3 py-2 rounded-full hover:bg-primary transition-colors"
            >
              Upload Rx
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-full hover:bg-muted" aria-label="Account">
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <div className="px-2 py-1.5 text-xs">
                    <div className="font-semibold text-primary-deep">{user.name}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                    <div className="mt-1 inline-block bg-mint text-primary-deep px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      {user.role}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/admin/orders" })}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Admin console
                    </DropdownMenuItem>
                  )}
                  {user.role !== "admin" && (
                    <DropdownMenuItem onClick={() => navigate({ to: "/prescription" })}>
                      Upload prescription
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logout();
                      navigate({ to: "/" });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate({ to: "/login" })}>
                    Sign in
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/login" })}>
                    Create account
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {isCustomer && (
            <Link
              to="/wishlist"
              className="p-2 rounded-full hover:bg-muted hidden sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}
          {isCustomer && (
            <Link
              to="/cart"
              className="relative p-2 rounded-full hover:bg-muted"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[10px] font-bold rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          )}
          <button className="md:hidden p-2 rounded-full hover:bg-muted" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
