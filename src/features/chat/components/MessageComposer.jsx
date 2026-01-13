import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSendMessage } from '../hooks/useSendMessage';
import styles from '../styles/ChatWidget.module.css';

export function MessageComposer({ conversationId, onSent }) {
  const queryClient = useQueryClient();
  const { sendMessageAsync, isLoading } = useSendMessage(conversationId);

  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);

  const disabled = !conversationId || isLoading;

  const onPickFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) setFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  const doSend = async () => {
    const cid = String(conversationId || '');
    const t = text.trim();

    if (!cid) return;
    if (!t && files.length === 0) return;

    try {
      const msg = await sendMessageAsync({
        conversationId: cid,
        text: t,
        attachments: files,
      });

      if (msg?._id) {
        queryClient.setQueryData(['chat', 'messages', cid], (old) => {
          const arr = Array.isArray(old) ? old : [];
          if (arr.some((m) => String(m?._id) === String(msg?._id))) return arr;
          return [...arr, msg];
        });

        queryClient.setQueryData(['chat', 'conversations'], (old) => {
          const arr = Array.isArray(old) ? old : [];
          return arr.map((c) =>
            String(c?._id) === cid
              ? { ...c, lastMessage: msg, updatedAt: msg?.createdAt || c.updatedAt }
              : c
          );
        });
      }

      setText('');
      setFiles([]);
      onSent?.();
    } catch (e) {
      console.error('[sendMessage failed]', e);
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
    <form onSubmit={onSubmit} className={styles.composer}>
      {files.length > 0 ? (
        <div className={styles.fileRow}>
          {files.map((f, idx) => (
            <span key={`${f.name}-${idx}`} className={styles.fileChip}>
              📎 {f.name}
              <button
                type="button"
                className={styles.fileRemove}
                onClick={() => setFiles((p) => p.filter((_, i) => i !== idx))}
                aria-label="Remove file"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.composerBar}>
        <input ref={fileRef} type="file" multiple hidden onChange={onPickFiles} />

        <button
          type="button"
          className={styles.iconBtn}
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          aria-label="Attach file"
          title="Attach"
        >
          📎
        </button>

        <textarea
          className={styles.textbox}
          placeholder={conversationId ? 'Aa' : 'Chọn một liên hệ để nhắn tin'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          rows={1}
        />

        <button type="submit" className={styles.sendBtn} disabled={disabled} aria-label="Send">
          {isLoading ? '…' : '➤'}
        </button>
      </div>
    </form>
  );
}
