import { NewConversationBox } from './NewConversationBox';
import { ConversationList } from './ConversationList';

export function ContactsSidebar({ onOpenConversation }) {
  return (
    <aside 
      className="fixed top-16 right-0 z-[950] flex h-[calc(100vh-64px)] w-80 flex-col overflow-hidden bg-white border-l border-gray-900/10 max-lg:hidden"
      aria-label="Contacts"
    >
      <header className="border-b border-gray-200 bg-white p-3">
        <h2 className="mb-2 inline-block rounded-lg bg-gradient-to-t from-amber-200 to-amber-400 px-2.5 py-1.5 text-base font-extrabold text-gray-900">
          Người liên hệ
        </h2>
        <NewConversationBox />
      </header>

      <div className="flex-1 overflow-y-auto bg-white p-2 min-h-0">
        <ConversationList onOpenConversation={onOpenConversation} />
      </div>
    </aside>
  );
}