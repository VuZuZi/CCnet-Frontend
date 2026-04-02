import { ImagePlus, SendHorizontal } from 'lucide-react';
import { useMessageComposer } from '@/features/chat/hooks/messages/useMessageComposer';
import ComposerReplyPreview from '../message/ComposerReplyPreview';
import ComposerFilePreviewList from '../message/ComposerFilePreviewList';

export function MessageComposer({ conversationId, onSent, onComposerFocus }) {
  const {
    disabled,
    isLoading,
    text,
    previewItems,
    replyingTo,
    fileRef,
    inputRef,
    notifyComposerFocus,
    handlePickFiles,
    handleOpenFilePicker,
    handleTextChange,
    handleSubmit,
    handleKeyDown,
    handleClearReply,
    removeFile,
  } = useMessageComposer({
    conversationId,
    onSent,
    onComposerFocus,
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-gray-200 bg-white p-3"
    >
      <ComposerReplyPreview
        replyingTo={replyingTo}
        onClear={handleClearReply}
      />

      <ComposerFilePreviewList
        previewItems={previewItems}
        onRemove={removeFile}
      />

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
          onChange={handlePickFiles}
        />

        <button
          type="button"
          disabled={disabled}
          onClick={handleOpenFilePicker}
          className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:bg-[#fff6d6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus className="h-5 w-5" />
        </button>

        <textarea
          ref={inputRef}
          rows={1}
          placeholder={
            conversationId
              ? 'Type a message...'
              : 'Choose a conversation to start chatting'
          }
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={notifyComposerFocus}
          disabled={disabled}
          className="max-h-[120px] min-h-[40px] flex-1 resize-none overflow-y-auto rounded-3xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 disabled:cursor-not-allowed disabled:bg-gray-50"
        />

        <button
          type="submit"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6c343] font-black text-gray-900 transition-transform hover:scale-105 hover:bg-[#ffd54d] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
        >
          {isLoading ? '…' : <SendHorizontal className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}

export default MessageComposer;