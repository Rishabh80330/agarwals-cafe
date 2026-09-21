import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// ==============================
// CUSTOMER PAGES
// ==============================
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import Contact from "./pages/Contact";

// ==============================
// ADMIN PAGES
// ==============================
import AdminDashboard from "./admin/AdminDashboard";
import AdminOrders from "./admin/AdminOrders";
import AdminMenu from "./admin/AdminMenu";
import AdminCategories from "./admin/AdminCategories";
import AdminRewards from "./admin/AdminRewards";
import AdminCustomers from "./admin/AdminCustomers";
import AdminMessages from "./admin/AdminMessages";
import AdminRoute from "./admin/AdminRoute";

// ==============================
// LAYOUTS
// ==============================
import AdminLayout from "./admin/AdminLayout";

// ==============================
// CUSTOMER NAVBAR
// ==============================
import Navbar from "./components/Navbar";


// ==========================================
// CUSTOMER LAYOUT
// ==========================================

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <Navbar />

      <Outlet />
    </div>
  );
};


// ==========================================
// APP
// ==========================================

const App = () => {
  return (
    <Routes>

      {/* ==================================
          CUSTOMER ROUTES
      ================================== */}

      <Route element={<CustomerLayout />}>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/menu"
          element={<Menu />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/rewards"
          element={<Rewards />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

      </Route>


      {/* ==================================
          ADMIN ROUTES
      ================================== */}

      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <AdminLayout>
            <AdminOrders />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/menu"
        element={
          <AdminLayout>
            <AdminMenu />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/categories"
        element={
          <AdminLayout>
            <AdminCategories />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/rewards"
        element={
          <AdminLayout>
            <AdminRewards />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/customers"
        element={
          <AdminLayout>
            <AdminCustomers />
          </AdminLayout>
        }
      />

      <Route
        path="/admin/messages"
        element={
          <AdminLayout>
            <AdminMessages />
          </AdminLayout>
        }
      />

      <Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AdminRoute>
  }
/>


      {/* ==================================
          FALLBACK
      ================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
};

export default App;