import { useEffect, useRef, useState } from 'react';
import { Expand, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConversationList } from './ConversationList';

export function ContactsSidebar({
  onConversationSelected,
  onOpenFullPage,
}) {
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleOpenMessagesPage = () => {
    setShowMenu(false);
    onOpenFullPage?.();
    navigate('/messages');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-black text-slate-900">Đoạn chat</h2>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              aria-label="More chat options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {showMenu ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={handleOpenMessagesPage}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  <Expand className="h-4 w-4" />
                  Mở trang tin nhắn
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <input
          type="text"
          placeholder="Tìm đoạn chat theo tên..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full rounded-full border border-amber-400 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          aria-label="Tìm đoạn chat theo tên"
        />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white p-2">
        <ConversationList
          onConversationSelected={onConversationSelected}
          searchKeyword={searchKeyword}
        />
      </div>
    </div>
  );
}

export default ContactsSidebar;