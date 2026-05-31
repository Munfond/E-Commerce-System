import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import SellerDashboard from "./pages/SellerDashboard";
import SellerCenterLayout from "./seller/center/SellerCenterLayout";
import SellerIndex from "./pages/SellerIndex";
import SellerOrders from "./pages/SellerOrders";
import SellerInventory from "./pages/SellerInventory";
import SellerProfile from "./pages/SellerProfile";
import AddProduct from "./pages/AddProduct";
import SellerGuard from "./auth/SellerGuard";
import UserGuard from "./auth/UserGuard";
import UserProfile from "./pages/UserProfile";
import SellerOnboardingLayout from "./seller/onboarding/SellerOnboardingLayout";
import SellerOnboardingIndex from "./pages/SellerOnboardingIndex";
import SellerOnboardingShop from "./pages/SellerOnboardingShop";
import SellerOnboardingShipping from "./pages/SellerOnboardingShipping";
import SellerOnboardingIdentity from "./pages/SellerOnboardingIdentity";
import SellerOnboardingTax from "./pages/SellerOnboardingTax";
import SellerOnboardingDone from "./pages/SellerOnboardingDone";

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "products", Component: ProductList },
      { path: "products/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
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
              { index: true, Component: SellerOnboardingIndex },
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
      { path: "*", Component: NotFound },
    ],
  },
]);
