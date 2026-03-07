import { chatAPI } from '../api/chatAPI';

function pickFilename(att) {
  const f = att?.filename || att?.fileName;
  if (f) return f;

  const url = att?.url || '';
  const parts = String(url).split('/');
  return parts[parts.length - 1] || null;
}

function pickDisplayName(att) {
  return att?.originalName || att?.name || att?.filename || att?.fileName || 'Tệp đính kèm';
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
    <div className={`flex my-[2px] w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[78%] break-words px-3 py-2 text-sm leading-[1.35] ${
          isMine 
            ? 'rounded-2xl rounded-br-lg border border-gray-900/10 bg-[#f6c343] text-gray-900' 
            : 'rounded-2xl rounded-bl-lg border border-gray-200 bg-white text-gray-900'
        }`}
      >
        {message?.text ? <div>{message.text}</div> : null}

        {attachments.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {attachments.map((a, idx) => (
              <button
                key={`${pickFilename(a) || idx}`}
                type="button"
                onClick={() => onDownload(a)}
                className="w-fit cursor-pointer rounded-lg border border-[#ffe08a] bg-[#fff6d6] px-2.5 py-2 text-left text-[13px] text-gray-900 transition-colors hover:bg-[#ffe8a6]"
              >
                📎 {pickDisplayName(a)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;