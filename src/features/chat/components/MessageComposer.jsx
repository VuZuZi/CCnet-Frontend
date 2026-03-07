import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSendMessage } from '../hooks/useSendMessage';
import { useAuthStore, authSelectors } from '@/features/auth/stores/useAuthStore';

export function MessageComposer({ conversationId, onSent }) {
  const queryClient = useQueryClient();
  const { sendMessageAsync, isLoading } = useSendMessage(conversationId);

  const user = useAuthStore(authSelectors.user);
  const myId = user?.userId || user?._id || user?.id;

  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);

  const fileRef = useRef(null);
  const inputRef = useRef(null);

  const disabled = !conversationId || isLoading;

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    if (!isLoading) focusInput();
  }, [isLoading, conversationId]);

  const onPickFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) setFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
    focusInput();
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const resetTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const doSend = async () => {
    const cid = String(conversationId || '');
    const t = text.trim();

    if (!cid) return;
    if (!t && files.length === 0) return;

    try {
      const res = await sendMessageAsync({
        conversationId: cid,
        text: t,
        attachments: files,
      });

      const msg = res?.data || res;

      if (msg?._id) {
        queryClient.setQueryData(['chat', 'messages', cid], (old) => {
          const arr = Array.isArray(old) ? old : [];
          if (arr.some((m) => String(m?._id) === String(msg?._id))) return arr;
          return [...arr, msg];
        });

        queryClient.setQueryData(['chat', 'conversations'], (old) => {
          const arr = Array.isArray(old) ? old : [];
          const idx = arr.findIndex((c) => String(c?._id) === cid);
          if (idx === -1) return arr;

          const current = arr[idx];
          const uc = current?.unreadCounts || {};
          const ucObj = typeof uc?.get === 'function'
              ? Object.fromEntries(Array.from(uc.entries()))
              : { ...(uc || {}) };

          const nextUnreadCounts = myId ? { ...ucObj, [String(myId)]: 0 } : ucObj;

          const updated = {
            ...current,
            lastMessage: msg,
            updatedAt: msg?.createdAt || current.updatedAt,
            unreadCounts: nextUnreadCounts,
          };

          return [updated, ...arr.filter((_, i) => i !== idx)];
        });
      }

      setText('');
      setFiles([]);
      resetTextareaHeight();
      onSent?.();
      focusInput();
    } catch (e) {
      console.error('[sendMessage failed]', e);
      focusInput();
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!disabled) await doSend();
  };

  const onKeyDown = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) await doSend();
    }
  };

  return (
    <form onSubmit={onSubmit} className="shrink-0 border-t border-gray-200 bg-white p-2.5">
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {files.map((f, idx) => (
            <span 
              key={`${f.name}-${idx}`} 
              className="inline-flex items-center gap-2 rounded-full border border-[#ffe08a] bg-[#fff6d6] px-2.5 py-1.5 text-xs text-gray-900"
            >
              📎 {f.name}
              <button
                type="button"
                className="text-sm font-bold text-gray-900 hover:text-red-600 focus:outline-none"
                onClick={() => setFiles((p) => p.filter((_, i) => i !== idx))}
                aria-label="Xóa file"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" multiple hidden onChange={onPickFiles} />

        <button
          type="button"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          aria-label="Đính kèm file"
          className="inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:bg-[#fff6d6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          📎
        </button>

        <textarea
          ref={inputRef}
          rows={1}
          placeholder={conversationId ? 'Aa' : 'Chọn một liên hệ để nhắn tin'}
          value={text}
          onChange={handleTextChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          className="max-h-[120px] min-h-[38px] flex-1 resize-none overflow-y-auto rounded-3xl border border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:cursor-not-allowed disabled:bg-gray-50 [scrollbar-width:none]"
        />

        <button
          type="submit"
          disabled={disabled}
          aria-label="Gửi tin nhắn"
          onMouseDown={(e) => e.preventDefault()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6c343] font-black text-gray-900 transition-transform hover:scale-105 hover:bg-[#ffd54d] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
        >
          {isLoading ? '…' : '➤'}
        </button>
      </div>
    </form>
  );
}

export default MessageComposer;