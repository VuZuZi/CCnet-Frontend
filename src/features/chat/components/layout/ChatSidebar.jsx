export default function ChatSidebar({ children }) {
  return (
    <aside className="hidden h-full min-w-[300px] w-[min(390px,42vw)] shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      {children}
    </aside>
  );
}
