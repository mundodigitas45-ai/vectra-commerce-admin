import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Customers } from "./pages/Customers";
import { AdminLayout } from "./layouts/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { Products } from "./pages/Products";
import { Inventory } from "./pages/Inventory";
import { Deliveries } from "./pages/Deliveries";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { NewOrder } from "./pages/NewOrder";
import { NewProduct } from "./pages/NewProduct";
import { NewCustomer } from "./pages/NewCustomer";
import { NewStockMovement } from "./pages/NewStockMovement";
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
        <Route path="/entregas" element={<Deliveries />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/pedidos/novo" element={<NewOrder />} />
        <Route path="/produtos/novo" element={<NewProduct />} />
        <Route path="/clientes/novo" element={<NewCustomer />} />
        <Route path="/estoque/movimentacao" element={<NewStockMovement />} />
      </Routes>
    </AdminLayout>
  );
}

export default App;