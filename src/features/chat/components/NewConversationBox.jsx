export function NewConversationBox({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Tìm đoạn chat theo tên..."
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="flex-1 rounded-full border border-amber-400 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        aria-label="Tìm đoạn chat theo tên"
      />
    </div>
  );
}

export default NewConversationBox;