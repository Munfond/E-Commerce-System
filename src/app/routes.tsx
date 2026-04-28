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
      { path: "seller", Component: SellerDashboard },
      {
        path: "seller/register",
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
      { path: "*", Component: NotFound },
    ],
  },
]);
