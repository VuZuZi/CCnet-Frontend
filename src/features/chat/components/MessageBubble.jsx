import { chatAPI } from '../api/chatAPI';
import styles from '../styles/ChatWidget.module.css';

function pickFilename(att) {
  const f = att?.filename || att?.fileName;
  if (f) return f;

  const url = att?.url || '';
  const parts = String(url).split('/');
  return parts[parts.length - 1] || null;
}

function pickDisplayName(att) {
  return att?.originalName || att?.name || att?.filename || att?.fileName || 'Attachment';
}

function downloadBlob(blob, name) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = name || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export function MessageBubble({ message, isMine }) {
  const attachments = message?.attachments || [];

  const onDownload = async (att) => {
    try {
      const filename = pickFilename(att);
      const displayName = pickDisplayName(att);
      if (!filename) return;

      const { blob } = await chatAPI.downloadFile(filename);
      downloadBlob(blob, displayName);
    } catch (e) {
      console.error('[downloadFile failed]', e);
    }
  };

  return (
    <div className={`${styles.bubbleRow} ${isMine ? styles.mineRow : styles.otherRow}`}>
      <div className={`${styles.bubble} ${isMine ? styles.mine : styles.other}`}>
        {message?.text ? <div>{message.text}</div> : null}

        {attachments.length > 0 ? (
          <div className="mt-2 d-flex flex-column gap-1">
            {attachments.map((a, idx) => (
              <button
                key={`${pickFilename(a) || idx}`}
                type="button"
                onClick={() => onDownload(a)}
                className={styles.attachment}
              >
                📎 {pickDisplayName(a)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MessageBubble;
