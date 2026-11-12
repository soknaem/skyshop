import { getCart, getToken } from "@/lib/api";
import BottomNav from "@/components/shop/BottomNav";
import ChatWidget from "@/components/shop/ChatWidget";
import Footer from "@/components/shop/Footer";
import Header from "@/components/shop/Header";
import NotificationProvider from "@/components/notifications/NotificationProvider";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [token, cart] = await Promise.all([getToken(), getCart()]);
  return (
    <NotificationProvider enabled={!!token}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 pb-24 outline-none md:pb-0">{children}</main>
        <Footer />
        <BottomNav cartCount={cart.count} loggedIn={!!token} />
        <ChatWidget />
      </div>
    </NotificationProvider>
  );
}
