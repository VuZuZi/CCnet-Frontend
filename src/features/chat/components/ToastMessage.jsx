// src/features/chat/components/ToastMessage.jsx
import toast from 'react-hot-toast';

export const showMessageToast = (senderInfo, messageText, messageConvId, openConversation) => {
    toast.custom(
        (t) => (
            <div
                className={`${
                    t.visible
                        ? 'animate-in slide-in-from-right-full fade-in duration-300'
                        : 'animate-out slide-out-to-right-full fade-out duration-200'
                } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer hover:shadow-2xl transition-all`}
                onClick={() => {
                    toast.dismiss(t.id);
                    // if (openConversation) {
                        openConversation(messageConvId);
                    // }
                }}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-0.5">
                            {senderInfo.avatar ? (
                                <img
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-200"
                                    src={senderInfo.avatar}
                                    alt={senderInfo.name}
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                    {senderInfo.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900">{senderInfo.name}</p>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{messageText}</p>
                            <p className="mt-1 text-xs text-gray-400">Vừa gửi tin nhắn mới</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.dismiss(t.id);
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        ),
        {
            duration: 5000,
            position: 'top-right',
            id: `msg-${messageConvId}-${Date.now()}`,
        }
    );
};