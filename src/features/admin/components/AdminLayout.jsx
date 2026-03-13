import { useState } from "react";
import { Link } from "react-router-dom";

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: "dashboard" },
    { id: "users", label: "User Management", icon: "group" },
    { id: "projects", label: "Projects", icon: "rocket_launch" },
    { id: "reports", label: "Reports & Logs", icon: "flag" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"} flex flex-col`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
            CC
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-slate-800">
              CCNet Admin
            </span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id} // <--- THIS is the fix. Ensure 'item.id' exists and is unique.
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                  : "text-slate-500 hover:bg-amber-100"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {isSidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link
            to="/logout"
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <span className="material-symbols-outlined">menu_open</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">System Admin</p>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                Online
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img
                src="https://ui-avatars.com/api/?name=Admin&background=random"
                alt="Avatar"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
