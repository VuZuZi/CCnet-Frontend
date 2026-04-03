export default function ChatSidebar({ children }) {
  return (
    <aside className="flex h-full w-[390px] shrink-0 flex-col border-r border-slate-200 bg-white">
      {children}
    </aside>
  );
}