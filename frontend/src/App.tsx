import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from '@/context/AuthContext';
import { RequireAuth, RequireAdmin } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import CatalogPage from '@/pages/CatalogPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import ProductFormPage from '@/pages/ProductFormPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import PaymentFailedPage from '@/pages/PaymentFailedPage';
import OrderDetailPage from '@/pages/OrderDetailPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <LoginPage /> },
      { path: "/login", element: <LoginPage /> },
      {
        path: "/catalog",
        element: <RequireAuth><CatalogPage /></RequireAuth>,
      },
      {
        path: "/products/:id",
        element: <RequireAuth><ProductDetailPage /></RequireAuth>,
      },
      {
        path: "/products/new",
        element: <RequireAdmin><ProductFormPage /></RequireAdmin>,
      },
      {
        path: "/products/:id/edit",
        element: <RequireAdmin><ProductFormPage /></RequireAdmin>,
      },
      {
        path: "/cart",
        element: <RequireAuth><CartPage /></RequireAuth>,
      },
      {
        path: "/checkout",
        element: <RequireAuth><CheckoutPage /></RequireAuth>,
      },
      {
        path: "/payment/success",
        element: <RequireAuth><PaymentSuccessPage /></RequireAuth>,
      },
      {
        path: "/order",
        element: <RequireAuth><OrderDetailPage /></RequireAuth>,
      },
      {
        path: "/payment/failed",
        element: <RequireAuth><PaymentFailedPage /></RequireAuth>,
      },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
