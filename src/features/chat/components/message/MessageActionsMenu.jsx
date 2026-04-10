import { useEffect, useRef, useState } from 'react';
import { Pin, Smile } from 'lucide-react';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

export default function MessageActionsMenu({
  canReply = true,
  canUnsend = false,
  canPin = false,
  isPinned = false,
  onReply,
  onUnsend,
  onReact,
  onPin,
  onUnpin,
  compact = false,
  align = 'right',
  variant = 'mine',
  className = '',
  ...rest
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pickerPositionClass = align === 'left' ? 'left-0' : 'right-0';

  const textButtonClass = compact
    ? 'inline-flex h-7 items-center whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold transition'
    : 'inline-flex h-8 items-center whitespace-nowrap rounded-full px-3 text-sm font-semibold transition';

  const iconButtonClass = compact
    ? 'flex h-7 w-7 items-center justify-center rounded-full text-[16px] transition'
    : 'flex h-8 w-8 items-center justify-center rounded-full text-[17px] transition';

  const pinButton = canPin ? (
    <>
      <div className="h-4 w-px shrink-0 bg-amber-200/80" />
      <button
        type="button"
        onClick={isPinned ? onUnpin : onPin}
        className={`${textButtonClass} shrink-0 ${
          isPinned
            ? 'text-amber-700 hover:bg-amber-50'
            : 'text-slate-700 hover:bg-amber-50'
        }`}
        title={isPinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn'}
      >
        <Pin className="mr-1.5 h-3.5 w-3.5" />
        {isPinned ? 'Bỏ ghim' : 'Ghim'}
      </button>
    </>
  ) : null;

  if (variant === 'incoming') {
    return (
      <div
        className={`inline-flex w-max max-w-none flex-nowrap items-center gap-1.5 rounded-2xl border border-amber-100 bg-white/95 px-2 py-1.5 shadow-[0_10px_26px_rgba(120,53,15,0.10)] backdrop-blur-sm ${className}`}
        {...rest}
      >
        <div className="flex items-center gap-1">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact?.(emoji)}
              className={`${iconButtonClass} hover:bg-amber-50`}
              title={`Thả cảm xúc ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {canReply ? (
          <>
            <div className="mx-0.5 h-5 w-px shrink-0 bg-amber-200/80" />
            <button
              type="button"
              onClick={onReply}
              className={`${textButtonClass} shrink-0 text-slate-700 hover:bg-amber-50`}
              title="Trả lời"
            >
              Trả lời
            </button>
          </>
        ) : null}

        {pinButton}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex w-max max-w-none flex-nowrap items-center gap-1 rounded-full border border-amber-100 bg-white/95 px-1.5 py-1 shadow-[0_8px_20px_rgba(120,53,15,0.10)] backdrop-blur-sm ${className}`}
      {...rest}
    >
      {canReply ? (
        <button
          type="button"
          onClick={onReply}
          className={`${textButtonClass} shrink-0 text-slate-700 hover:bg-amber-50`}
          title="Trả lời"
        >
          Trả lời
        </button>
      ) : null}

      {canUnsend ? (
        <>
          <div className="h-4 w-px shrink-0 bg-amber-200/80" />
          <button
            type="button"
            onClick={onUnsend}
            className={`${textButtonClass} shrink-0 text-red-600 hover:bg-red-50`}
            title="Thu hồi"
          >
            Thu hồi
          </button>
        </>
      ) : null}

      {pinButton}

      <div className="h-4 w-px shrink-0 bg-amber-200/80" />

      <div className="relative shrink-0" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`flex items-center justify-center rounded-full text-amber-700 transition hover:bg-amber-50 ${
            compact ? 'h-7 w-7' : 'h-8 w-8'
          }`}
          title="Bày tỏ cảm xúc"
        >
          <Smile className="h-4 w-4" />
        </button>

        {showEmojiPicker ? (
          <div
            className={`absolute bottom-[calc(100%+8px)] ${pickerPositionClass} z-30 rounded-full border border-amber-100 bg-white px-2 py-1 shadow-xl`}
          >
            <div className="flex items-center gap-1">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onReact?.(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className={`flex items-center justify-center rounded-full text-base transition hover:bg-amber-50 ${
                    compact ? 'h-7 w-7' : 'h-8 w-8'
                  }`}
                  title={`Thả cảm xúc ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}