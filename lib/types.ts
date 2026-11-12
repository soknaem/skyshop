export type Category = { id: number; name: string; slug: string; icon: string; sort_order: number; product_count: number };

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  compare_price: number | null;
  discount_percent: number;
  stock_qty: number;
  brand: string;
  category: { id: number; name: string; slug: string } | null;
  category_id: number | null;
  warranty: string;
  featured: boolean;
  sold_count: number;
  specs: Record<string, string>;
  images: string[];
  image_url: string;
  status: "ACTIVE" | "INACTIVE";
  in_stock: boolean;
  created_at: string | null;
};

export type Page<T> = { items: T[]; total: number; page: number; page_size: number };
export type Facets = { brands: { name: string; count: number }[]; price_min: number; price_max: number };

export type CartItem = {
  product_id: number; name: string; brand: string; image_url: string; price: number; qty: number;
  stock_qty: number; subtotal: number; available: boolean;
};
export type Cart = { items: CartItem[]; total: number; count: number; currency: string };

export type PaymentInfo = {
  public_id: string; status: "PENDING" | "PAID" | "EXPIRED" | "SUPERSEDED"; amount: number; currency: string;
  expires_at: string; qr_image: string | null; mock: boolean;
};

export type OrderItem = { product_id: number; product_name: string; image_url: string; unit_price: number; qty: number; subtotal: number };
export type Fulfillment = "PICKUP" | "DELIVERY";
export type FulfillmentStatus = "PENDING" | "PROCESSING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED";

export type Order = {
  id: number; order_no: string; status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
  fulfillment: Fulfillment; fulfillment_status: FulfillmentStatus;
  customer_name: string | null; email: string | null; phone: string | null; shipping_address: string | null;
  subtotal: number; delivery_fee: number; total_amount: number; currency: string;
  created_at: string; paid_at: string | null; items: OrderItem[]; payment: PaymentInfo | null;
  shop: { address: string; hours: string; name: string };
};

export type MyOrder = {
  order_no: string; status: Order["status"]; fulfillment: Fulfillment; fulfillment_status: FulfillmentStatus;
  total_amount: number; currency: string; created_at: string; item_count: number;
  preview: { name: string; image_url: string }[];
};

export type ShopConfig = {
  currency: string; mock_mode: boolean; payment_ttl_min: number; shop_name: string;
  shop_address: string; shop_hours: string; delivery_fee: number;
};

export type Profile = { id: number; username: string; name: string; email: string; phone: string; avatar_url: string; provider: string; role: string };

export type ReportOrderRow = {
  id: number; order_no: string; customer_name: string; phone: string; fulfillment: Fulfillment;
  fulfillment_status: FulfillmentStatus; total_amount: number; currency: string; order_date: string;
};
export type ReportOrder = ReportOrderRow & {
  status: string; email: string; shipping_address: string; subtotal: number; delivery_fee: number;
  created_at: string; items: OrderItem[];
};
export type Summary = {
  total_orders: number; total_revenue: number; today_orders: number; today_revenue: number; average_order: number;
  currency: string | null; pickup_orders: number; delivery_orders: number; open_orders: number;
};
export type DayPoint = { date: string; orders: number; revenue: number };
export type TopProduct = { product_name: string; qty: number; revenue: number };

export type NotificationItem = {
  id: number; type: string; title: string; body: string; url: string; level: "info" | "success" | "warning";
  read: boolean; created_at: string;
};

export type ManagedUser = {
  id: number; username: string; name: string; email: string; phone: string; avatar_url: string; provider: string;
  role: "ADMIN" | "CUSTOMER"; is_active: boolean; last_login: string | null; created_at: string;
};
export type UserSummary = { total: number; admins: number; customers: number; disabled: number; active: number; new_7d: number; by_provider: Record<string, number> };
