import { supabase } from "./supabase";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  ""
);

type ApiResponse<T> = { data: T };

type CartItemDto = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
};

type ProductDto = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category_slug: string | null;
  stock: number;
};

type OrderDto = {
  id: string;
  user_id: string;
  customer_email: string;
  customer_name: string;
  items: { product_id: string; quantity: number; unit_price: number }[];
  notes: string | null;
  status: string;
  payment_method: "esewa" | "cod" | null;
  payment_status: "paid" | "pending" | "cod" | null;
  shipping: number | null;
  created_at: string;
};

type PrescriptionDto = {
  id: string;
  user_id: string;
  customer_email: string;
  customer_name: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  notes: string | null;
  reviewer_note: string | null;
  reviewed_at: string | null;
  status: string;
  created_at: string;
};

type FavoriteRow = {
  id: string;
  product_id: string;
  products: ProductDto | null;
};

type ServiceDto = {
  id: string;
  name: string;
  type: "lab" | "physiotherapy";
  description: string | null;
  price: number;
  duration: string | null;
  home_available: boolean;
  active?: boolean;
  created_at?: string;
};

type BookingDto = {
  id: string;
  service_id: string;
  user_id: string;
  visit_type: "home" | "clinic";
  preferred_date: string;
  preferred_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};

type MarketingDiscount = {
  id: string;
  product_id: string;
  percent: number;
  active: boolean;
  created_at: string;
};

type MarketingBanner = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  placement: "home" | "products" | "checkout";
  active: boolean;
  created_at: string;
};

type EsewaPaymentData = {
  amount: string;
  tax_amount: string;
  product_service_charge: string;
  product_delivery_charge: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
  success_url: string;
  failure_url: string;
};

const getAccessToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> => {
  if (!API_BASE) {
    throw new Error("Missing VITE_API_URL");
  }

  const headers = new Headers(options.headers);

  // Only set Content-Type for requests that carry a body
  if (options.body !== undefined && options.body !== null) {
    headers.set("Content-Type", "application/json");
  }

  if (requireAuth) {
    const token = await getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = payload?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
};

export const api = {
  async signup(input: { name: string; email: string; password: string }) {
    const res = await apiFetch<ApiResponse<{ id: string; email: string }>>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input)
    });
    return res.data;
  },
  async forgotPassword(email: string): Promise<{ sent: boolean; devLink?: string }> {
    return apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  },
  async listProducts(limit = 200) {
    const res = await apiFetch<ApiResponse<ProductDto[]>>(`/products?limit=${limit}`);
    return res.data;
  },
  async listActiveDiscounts() {
    const res = await apiFetch<ApiResponse<{ product_id: string; percent: number }[]>>("/products/discounts/active");
    return res.data;
  },
  async listCart() {
    const res = await apiFetch<ApiResponse<CartItemDto[]>>("/cart", {}, true);
    return res.data;
  },
  async addCartItem(input: { product_id: string; quantity: number }) {
    const res = await apiFetch<ApiResponse<CartItemDto>>("/cart", {
      method: "POST",
      body: JSON.stringify(input)
    }, true);
    return res.data;
  },
  async updateCartItem(id: string, quantity: number) {
    const res = await apiFetch<ApiResponse<CartItemDto>>(`/cart/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity })
    }, true);
    return res.data;
  },
  async removeCartItem(id: string) {
    await apiFetch<void>(`/cart/${id}`, { method: "DELETE" }, true);
  },
  async clearCart() {
    await apiFetch<void>("/cart", { method: "DELETE" }, true);
  },
  async listOrders() {
    const res = await apiFetch<ApiResponse<OrderDto[]>>("/orders", {}, true);
    return res.data;
  },
  async listPrescriptions() {
    const res = await apiFetch<ApiResponse<PrescriptionDto[]>>("/prescriptions", {}, true);
    return res.data;
  },
  async createOrder(input: {
    items: { product_id: string; quantity: number }[];
    notes?: string;
    customer_email: string;
    customer_name: string;
    payment_method?: "esewa" | "cod";
    shipping?: number;
  }) {
    const res = await apiFetch<ApiResponse<OrderDto>>("/orders", {
      method: "POST",
      body: JSON.stringify(input)
    }, true);
    return res.data;
  },
  async cancelOrder(id: string) {
    const res = await apiFetch<ApiResponse<OrderDto>>(`/orders/${id}/cancel`, {
      method: "PATCH"
    }, true);
    return res.data;
  },
  async adminListOrders() {
    const res = await apiFetch<ApiResponse<OrderDto[]>>("/admin/orders", {}, true);
    return res.data;
  },
  async adminUpdateOrder(id: string, status: string) {
    const res = await apiFetch<ApiResponse<OrderDto>>(`/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: status.toLowerCase() })
    }, true);
    return res.data;
  },
  async adminListPrescriptions() {
    const res = await apiFetch<ApiResponse<PrescriptionDto[]>>("/admin/prescriptions", {}, true);
    return res.data;
  },
  async adminUpdatePrescription(id: string, payload: { status: string; reviewer_note?: string }) {
    const res = await apiFetch<ApiResponse<PrescriptionDto>>(`/admin/prescriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }, true);
    return res.data;
  },
  async createPrescriptionUploadUrl(input: { fileExt: string; contentType: string }) {
    const res = await apiFetch<{ path: string; signedUrl: string }>("/prescriptions/upload-url", {
      method: "POST",
      body: JSON.stringify(input)
    }, true);
    return res;
  },
  async createPrescription(input: {
    path: string;
    notes?: string;
    file_name: string;
    file_type: string;
    file_size: number;
    customer_email: string;
    customer_name: string;
  }) {
    const res = await apiFetch<ApiResponse<PrescriptionDto>>("/prescriptions", {
      method: "POST",
      body: JSON.stringify(input)
    }, true);
    return res.data;
  },
  async listFavorites() {
    const res = await apiFetch<ApiResponse<FavoriteRow[]>>("/favorites", {}, true);
    return res.data;
  },
  async addFavorite(productId: string) {
    const res = await apiFetch<ApiResponse<FavoriteRow>>("/favorites", {
      method: "POST",
      body: JSON.stringify({ product_id: productId })
    }, true);
    return res.data;
  },
  async removeFavorite(productId: string) {
    await apiFetch<void>(`/favorites/${productId}`, { method: "DELETE" }, true);
  },
  async listWishlist() {
    const res = await apiFetch<ApiResponse<FavoriteRow[]>>("/wishlist", {}, true);
    return res.data;
  },
  async addWishlist(productId: string) {
    const res = await apiFetch<ApiResponse<FavoriteRow>>("/wishlist", {
      method: "POST",
      body: JSON.stringify({ product_id: productId })
    }, true);
    return res.data;
  },
  async removeWishlist(productId: string) {
    await apiFetch<void>(`/wishlist/${productId}`, { method: "DELETE" }, true);
  },
  async adminListProducts() {
    const res = await apiFetch<ApiResponse<ProductDto[]>>("/admin/products", {}, true);
    return res.data;
  },
  async adminCreateProduct(input: { name: string; price: number; image_url?: string; category_slug?: string; stock?: number }) {
    const res = await apiFetch<ApiResponse<ProductDto>>("/admin/products", {
      method: "POST",
      body: JSON.stringify(input)
    }, true);
    return res.data;
  },
  async adminUpdateProduct(id: string, input: { name?: string; price?: number; image_url?: string; category_slug?: string; stock?: number }) {
    const res = await apiFetch<ApiResponse<ProductDto>>(`/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }, true);
    return res.data;
  },
  async adminDeleteProduct(id: string) {
    await apiFetch<void>(`/admin/products/${id}`, { method: "DELETE" }, true);
  },
  async adminListDiscounts() {
    const res = await apiFetch<ApiResponse<MarketingDiscount[]>>(
      "/admin/marketing/discounts",
      {},
      true
    );
    return res.data;
  },
  async adminCreateDiscount(input: { product_id: string; percent: number; active?: boolean }) {
    const res = await apiFetch<ApiResponse<MarketingDiscount>>(
      "/admin/marketing/discounts",
      { method: "POST", body: JSON.stringify(input) },
      true
    );
    return res.data;
  },
  async adminUpdateDiscount(id: string, input: { product_id?: string; percent?: number; active?: boolean }) {
    const res = await apiFetch<ApiResponse<MarketingDiscount>>(
      `/admin/marketing/discounts/${id}`,
      { method: "PATCH", body: JSON.stringify(input) },
      true
    );
    return res.data;
  },
  async adminDeleteDiscount(id: string) {
    await apiFetch<void>(`/admin/marketing/discounts/${id}`, { method: "DELETE" }, true);
  },
  async adminListBanners() {
    const res = await apiFetch<ApiResponse<MarketingBanner[]>>(
      "/admin/marketing/banners",
      {},
      true
    );
    return res.data;
  },
  async adminCreateBanner(input: { title: string; description?: string; image_url?: string; placement: "home" | "products" | "checkout"; active?: boolean }) {
    const res = await apiFetch<ApiResponse<MarketingBanner>>(
      "/admin/marketing/banners",
      { method: "POST", body: JSON.stringify(input) },
      true
    );
    return res.data;
  },
  async adminUpdateBanner(id: string, input: { title?: string; description?: string; image_url?: string; placement?: "home" | "products" | "checkout"; active?: boolean }) {
    const res = await apiFetch<ApiResponse<MarketingBanner>>(
      `/admin/marketing/banners/${id}`,
      { method: "PATCH", body: JSON.stringify(input) },
      true
    );
    return res.data;
  },
  async adminDeleteBanner(id: string) {
    await apiFetch<void>(`/admin/marketing/banners/${id}`, { method: "DELETE" }, true);
  },
  // Services
  async listServices() {
    const res = await apiFetch<ApiResponse<ServiceDto[]>>("/services");
    return res.data;
  },
  async createBooking(input: {
    service_id: string;
    visit_type: "home" | "clinic";
    preferred_date: string;
    preferred_time: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    notes?: string;
  }) {
    const res = await apiFetch<ApiResponse<BookingDto>>("/services/bookings", {
      method: "POST",
      body: JSON.stringify(input)
    }, true);
    return res.data;
  },
  async listMyBookings() {
    const res = await apiFetch<ApiResponse<BookingDto[]>>("/services/bookings", {}, true);
    return res.data;
  },
  // Admin services
  async adminListServices() {
    const res = await apiFetch<ApiResponse<ServiceDto[]>>("/admin/services", {}, true);
    return res.data;
  },
  async adminCreateService(input: { name: string; type: "lab" | "physiotherapy"; description?: string; price: number; duration?: string; home_available?: boolean; active?: boolean }) {
    const res = await apiFetch<ApiResponse<ServiceDto>>("/admin/services", {
      method: "POST",
      body: JSON.stringify(input)
    }, true);
    return res.data;
  },
  async adminUpdateService(id: string, input: Partial<{ name: string; type: "lab" | "physiotherapy"; description: string; price: number; duration: string; home_available: boolean; active: boolean }>) {
    const res = await apiFetch<ApiResponse<ServiceDto>>(`/admin/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }, true);
    return res.data;
  },
  async adminDeleteService(id: string) {
    await apiFetch<void>(`/admin/services/${id}`, { method: "DELETE" }, true);
  },
  async adminListBookings() {
    const res = await apiFetch<ApiResponse<BookingDto[]>>("/admin/bookings", {}, true);
    return res.data;
  },
  async adminUpdateBooking(id: string, status: string) {
    const res = await apiFetch<ApiResponse<BookingDto>>(`/admin/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    }, true);
    return res.data;
  },
  async initiateEsewaPayment(input: { order_id: string; amount: number; tax_amount?: number; delivery_charge?: number }) {
    const res = await apiFetch<ApiResponse<EsewaPaymentData>>("/payments/initiate", {
      method: "POST",
      body: JSON.stringify(input)
    }, true);
    return res.data;
  },
  async verifyEsewaPayment(encoded_response: string) {
    const res = await apiFetch<ApiResponse<{ status: string; transaction_uuid: string; order_id: string }>>("/payments/verify", {
      method: "POST",
      body: JSON.stringify({ encoded_response })
    }, true);
    return res.data;
  }
};

export type {
  ProductDto,
  OrderDto,
  PrescriptionDto,
  FavoriteRow,
  MarketingDiscount,
  MarketingBanner,
  ServiceDto,
  BookingDto
};
