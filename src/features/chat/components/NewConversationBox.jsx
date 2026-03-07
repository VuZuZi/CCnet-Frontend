import { useState } from 'react';
import { useCreateConversation } from '../hooks/useCreateConversation';

export function NewConversationBox() {
  const [participantId, setParticipantId] = useState('');
  const { createConversation, isLoading } = useCreateConversation();

  const handleStart = () => {
    const id = participantId.trim();
    if (!id) return;

    createConversation({ participantId: id });
    setParticipantId('');
  };

  return (
    <form 
      className="flex items-center gap-2"
      onSubmit={(e) => { e.preventDefault(); handleStart(); }}
    >
      <input
        type="text"
        placeholder="Nhập ID người dùng..."
        value={participantId}
        onChange={(e) => setParticipantId(e.target.value)}
        disabled={isLoading}
        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:cursor-not-allowed disabled:bg-gray-50"
        aria-label="User ID"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="min-w-[86px] rounded-lg bg-[#f6c343] px-3.5 py-2.5 text-sm font-extrabold text-gray-900 transition-all hover:bg-[#ffd54d] hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        {isLoading ? '...' : 'Bắt đầu'}
      </button>
    </form>
  );
}

export default NewConversationBox;