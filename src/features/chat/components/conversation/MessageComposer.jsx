import { ImagePlus, SendHorizontal } from "lucide-react";
import { CHAT_UPLOAD_ACCEPT } from "@/features/chat/constants/chatUpload.constants";
import { useMessageComposer } from "@/features/chat/hooks/messages/useMessageComposer";
import ComposerReplyPreview from "../message/ComposerReplyPreview";
import ComposerFilePreviewList from "../message/ComposerFilePreviewList";

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
      className="shrink-0 border-t border-gray-200 bg-white px-3 py-3"
    >
      <ComposerReplyPreview replyingTo={replyingTo} onClear={handleClearReply} />

      <ComposerFilePreviewList previewItems={previewItems} onRemove={removeFile} />

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept={CHAT_UPLOAD_ACCEPT}
          onChange={handlePickFiles}
        />

        <button
          type="button"
          disabled={disabled}
          onClick={handleOpenFilePicker}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700 transition-colors hover:bg-[#fff6d6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus className="h-5 w-5" />
        </button>

        <textarea
          ref={inputRef}
          rows={1}
          placeholder={
            conversationId
              ? "Type a message..."
              : "Choose a conversation to start chatting"
          }
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={notifyComposerFocus}
          disabled={disabled}
          className="max-h-[120px] min-h-[42px] flex-1 resize-none overflow-y-auto rounded-3xl border border-amber-400 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-400 disabled:cursor-not-allowed disabled:bg-gray-50"
        />

        <button
          type="submit"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6c343] font-black text-gray-900 transition-transform hover:scale-105 hover:bg-[#ffd54d] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:scale-100"
        >
          {isLoading ? "…" : <SendHorizontal className="h-4.5 w-4.5" />}
        </button>
      </div>
    </form>
  );
}

export default MessageComposer;