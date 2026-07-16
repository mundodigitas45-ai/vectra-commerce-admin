import {
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  PackageSearch,
  Settings,
  ShoppingCart,
  Truck,
  Users
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: ChartNoAxesCombined,
    to: "/"
  },
  {
    label: "Pedidos",
    icon: ClipboardList,
    to: "/pedidos"
  },
  {
    label: "Produtos",
    icon: ShoppingCart,
    to: "/produtos"
  },
  {
    label: "Clientes",
    icon: Users,
    to: "/clientes"
  },
  {
    label: "Estoque",
    icon: Boxes,
    to: "/estoque"
  },
  {
    label: "Entregas",
    icon: Truck,
    to: "/entregas"
  },
  {
    label: "Relatórios",
    icon: PackageSearch,
    to: "/relatorios"
  },
  {
    label: "Configurações",
    icon: Settings,
    to: "/configuracoes"
  }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">VC</div>

        <div className="brand-text">
          <strong>Vectra Commerce</strong>
          <span>Admin</span>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <strong>Miranda Express</strong>
        <span>Mangueirão, Belém - PA</span>
      </div>
    </aside>
  );
}