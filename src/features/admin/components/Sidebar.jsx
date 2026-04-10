// src/components/Sidebar.jsx
const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: "dashboard", active: true },
    { name: "Users", icon: "group", active: false },
    { name: "Notifications", icon: "notifications", active: false },
    { name: "Reports", icon: "bar_chart", active: false },
    { name: "Settings", icon: "settings", active: false },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center gap-3 px-2 py-6 mb-4">
          <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-none tracking-tight">
              CCNet
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Admin Oversight
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href="#"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                item.active
                  ? "bg-yellow-200 text-yellow-800 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
