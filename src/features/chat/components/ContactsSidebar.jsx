import { useState } from 'react';
import { NewConversationBox } from './NewConversationBox';
import { ConversationList } from './ConversationList';

export function ContactsSidebar({ onOpenConversation, onConversationSelected }) {
  const [searchKeyword, setSearchKeyword] = useState('');

  return (
    <div className="flex max-h-[70vh] min-h-[420px] flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-black text-gray-900">Đoạn chat</h2>
          <button
            type="button"
            className="rounded-full px-2 py-1 text-sm font-bold text-gray-500 hover:bg-gray-100"
          >
            •••
          </button>
        </div>

        <NewConversationBox
          value={searchKeyword}
          onChange={setSearchKeyword}
        />
      </header>

      <div className="flex-1 overflow-y-auto bg-white p-2 min-h-0">
        <ConversationList
          onOpenConversation={onOpenConversation}
          onConversationSelected={onConversationSelected}
          searchKeyword={searchKeyword}
        />
      </div>
    </div>
  );
}