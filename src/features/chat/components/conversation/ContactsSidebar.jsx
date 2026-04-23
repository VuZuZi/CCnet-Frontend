import { useEffect, useRef, useState } from "react";
import { Expand, MoreHorizontal, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConversationList } from "./ConversationList";

export function ContactsSidebar({
  onConversationSelected,
  onOpenFullPage,
}) {
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleOpenMessagesPage = () => {
    setShowMenu(false);
    onOpenFullPage?.();
    navigate("/messages");
  };

    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="border-b border-[#FBBF24]/70 bg-[#FBBF24] px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="mb-1 inline-flex items-center rounded-full border border-white/60 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900">
              Hộp thư
            </div>
            <h2 className="text-[18px] font-black text-slate-900">Tin nhắn</h2>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-700 transition-colors hover:bg-white"
              aria-label="Tùy chọn đoạn chat"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showMenu ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <button
                type="button"
                onClick={handleOpenMessagesPage}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
              >
                  <Expand className="h-4 w-4" />
                  Mở trang tin nhắn
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm đoạn chat theo tên..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="h-11 w-full rounded-full border border-white/70 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-white focus:bg-white focus:ring-2 focus:ring-white/70"
            aria-label="Tìm đoạn chat theo tên"
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-2 py-2">
        <ConversationList
          onConversationSelected={onConversationSelected}
          searchKeyword={searchKeyword}
        />
      </div>
    </div>
  );
}

export default ContactsSidebar;
