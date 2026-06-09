import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import SellerDashboard from "./pages/SellerDashboard";
import SellerCenterLayout from "./seller/center/SellerCenterLayout";
import SellerIndex from "./pages/SellerIndex";
import SellerOrders from "./pages/SellerOrders";
import SellerInventory from "./pages/SellerInventory";
import SellerProfile from "./pages/SellerProfile";
import AddProduct from "./pages/AddProduct";
import SellerProductDetail from "./pages/SellerProductDetail";
import SellerVoucherCreate from "./pages/SellerVoucherCreate.tsx";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import SellerGuard from "./auth/SellerGuard";
import AdminGuard from "./auth/AdminGuard";
import AdminLayout from "./admin/AdminLayout";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCategoryForm from "./pages/admin/AdminCategoryForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminShops from "./pages/admin/AdminShops";
import AdminUsers from "./pages/admin/AdminUsers";
import UserGuard from "./auth/UserGuard";
import UserProfile from "./pages/UserProfile";
import SellerOnboardingLayout from "./seller/onboarding/SellerOnboardingLayout";
import SellerOnboardingShop from "./pages/SellerOnboardingShop";
import SellerOnboardingShipping from "./pages/SellerOnboardingShipping";
import SellerOnboardingIdentity from "./pages/SellerOnboardingIdentity";
import SellerOnboardingTax from "./pages/SellerOnboardingTax";
import SellerOnboardingDone from "./pages/SellerOnboardingDone";
import ShopDetails from './pages/ShopDetails';
import GoogleOAuthCallback from './pages/GoogleOAuthCallback';
import About from './pages/info/About';
import Careers from './pages/info/Careers';
import Terms from './pages/info/Terms';
import Privacy from './pages/info/Privacy';
import BuyingGuide from './pages/info/BuyingGuide';
import Returns from './pages/info/Returns';
import PaymentMethods from './pages/info/PaymentMethods';
import Contact from './pages/info/Contact';

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "about", Component: About },
      { path: "careers", Component: Careers },
      { path: "terms", Component: Terms },
      { path: "privacy", Component: Privacy },
      { path: "buying-guide", Component: BuyingGuide },
      { path: "returns", Component: Returns },
      { path: "payment-methods", Component: PaymentMethods },
      { path: "contact", Component: Contact },
      { path: "products", Component: ProductList },
      { path: "products/:id", Component: ProductDetail },
      { path: "search", Component: Search },
      { path: "cart", Component: Cart },
      { path: "shops/:id", Component: ShopDetails },
      { path: "api/v1/auth/google/callback", Component: GoogleOAuthCallback },
      {
        path: "admin",
        Component: AdminGuard,
        children: [
          {
            path: "",
            Component: AdminLayout,
            children: [
              { path: "categories", Component: AdminCategories },
              { path: "categories/add", Component: AdminCategoryForm },
              { path: "categories/:id/edit", Component: AdminCategoryForm },
              { path: "orders", Component: AdminOrders },
              { path: "shops", Component: AdminShops },
              { path: "users", Component: AdminUsers },
            ],
          },
        ],
      },
      {
        path: "seller",
        Component: SellerGuard,
        children: [
          {
            path: "",
            Component: SellerCenterLayout,
            children: [
              { index: true, Component: SellerIndex },
              { path: "products", Component: SellerDashboard },
              { path: "products/add", Component: AddProduct },
              { path: "products/:id", Component: SellerProductDetail },
              { path: "vouchers", Component: SellerVoucherCreate },
              { path: "profile", Component: SellerProfile },
              { path: "orders", Component: SellerOrders },
              { path: "inventory", Component: SellerInventory },
            ],
          }
        ],
      },
      {
        path: "seller/register",
        Component: UserGuard,
        children: [
          {
            path: "",
            Component: SellerOnboardingLayout,
            children: [
              { index: true, Component: SellerOnboardingShop },
              { path: "shop", Component: SellerOnboardingShop },
              { path: "shipping", Component: SellerOnboardingShipping },
              { path: "identity", Component: SellerOnboardingIdentity },
              { path: "tax", Component: SellerOnboardingTax },
              { path: "done", Component: SellerOnboardingDone },
            ],
          },
        ],
      },
      {
        path: "profile",
        Component: UserGuard,
        children: [{ index: true, Component: UserProfile }],
      },
      {
        path: "orders",
        Component: UserGuard,
        children: [
          { index: true, Component: Orders },
          { path: ":id", Component: OrderDetail },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
