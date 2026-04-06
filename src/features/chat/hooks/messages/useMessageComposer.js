import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/shared/contexts/ToastContext";
import { useChatStore, chatSelectors } from "@/features/chat/stores/useChatStore";
import { useSendMessage } from "@/features/chat/hooks/messages/useSendMessage";
import { validateAndMergeChatFiles } from "@/features/chat/utils/chatUpload.validate";

function isImageFile(file) {
  return String(file?.type || "").startsWith("image/");
}

function buildPreviewItems(files = []) {
  return (Array.isArray(files) ? files : []).map((file) => ({
    file,
    isImage: isImageFile(file),
    previewUrl: isImageFile(file) ? URL.createObjectURL(file) : "",
  }));
}

function revokePreviewItems(previewItems = []) {
  previewItems.forEach((item) => {
    if (!item?.previewUrl) return;

    try {
      URL.revokeObjectURL(item.previewUrl);
    } catch {
      return;
    }
  });
}

export function useMessageComposer({ conversationId, onSent, onComposerFocus }) {
  const toast = useToast();
  const { sendMessageAsync, isLoading } = useSendMessage(conversationId);

  const replyingTo = useChatStore(
    chatSelectors.replyDraftByConversation(conversationId)
  );
  const clearReplyDraft = useChatStore((state) => state.clearReplyDraft);

  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  const fileRef = useRef(null);
  const inputRef = useRef(null);

  const disabled = !conversationId || isLoading;
  const previewItems = useMemo(() => buildPreviewItems(files), [files]);

  useEffect(() => {
    return () => {
      revokePreviewItems(previewItems);
    };
  }, [previewItems]);

  const notifyComposerFocus = useCallback(() => {
    onComposerFocus?.();
  }, [onComposerFocus]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!conversationId || isLoading) return;
    focusInput();
  }, [conversationId, isLoading, focusInput]);

  const resetComposer = useCallback(() => {
    setText("");
    setFiles([]);

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
    }
  }, []);

  const handlePickFiles = useCallback(
    (event) => {
      const selectedFiles = Array.from(event.target.files || []);
      const { acceptedFiles, rejectedMessages } = validateAndMergeChatFiles(
        files,
        selectedFiles
      );

      if (acceptedFiles.length > 0) {
        setFiles((prev) => [...prev, ...acceptedFiles]);
      }

      if (rejectedMessages.length > 0) {
        rejectedMessages.forEach((message, index) => {
          toast.warning(message, index === 0 ? 4500 : 5200);
        });
      }

      event.target.value = "";
      notifyComposerFocus();
      focusInput();
    },
    [files, focusInput, notifyComposerFocus, toast]
  );

  const handleOpenFilePicker = useCallback(() => {
    notifyComposerFocus();
    fileRef.current?.click();
  }, [notifyComposerFocus]);

  const handleTextChange = useCallback((event) => {
    setText(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
  }, []);

  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  const handleClearReply = useCallback(() => {
    clearReplyDraft(conversationId);
  }, [clearReplyDraft, conversationId]);

  const doSend = useCallback(async () => {
    const cid = String(conversationId || "");
    const trimmedText = text.trim();

    if (!cid) return;
    if (!trimmedText && files.length === 0) return;

    try {
      await sendMessageAsync({
        conversationId: cid,
        text: trimmedText,
        files,
        replyTo: replyingTo?._id || null,
        replyToMessage: replyingTo || null,
      });

      resetComposer();
      clearReplyDraft(cid);
      onSent?.();
      focusInput();
    } catch {
      focusInput();
    }
  }, [
    clearReplyDraft,
    conversationId,
    files,
    focusInput,
    onSent,
    replyingTo,
    resetComposer,
    sendMessageAsync,
    text,
  ]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!disabled) {
        await doSend();
      }
    },
    [disabled, doSend]
  );

  const handleKeyDown = useCallback(
    async (event) => {
      if (event.key === "Escape" && replyingTo) {
        handleClearReply();
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (!disabled) {
          await doSend();
        }
      }
    },
    [disabled, doSend, handleClearReply, replyingTo]
  );

  return {
    disabled,
    isLoading,
    text,
    files,
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
  };
}

export default useMessageComposer;