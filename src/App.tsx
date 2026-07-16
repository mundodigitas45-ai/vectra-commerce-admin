import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Customers } from "./pages/Customers";
import { AdminLayout } from "./layouts/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { Products } from "./pages/Products";
import { Inventory } from "./pages/Inventory";

function App() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/estoque" element={<Inventory />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/pedidos" element={<Orders />} />
        <Route path="/produtos" element={<Products />} />
        <Route path="/clientes" element={<Customers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default App;