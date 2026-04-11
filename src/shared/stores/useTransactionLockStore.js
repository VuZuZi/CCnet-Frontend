import { create } from 'zustand';

export const useTransactionLockStore = create((set) => ({
    isLocked: false,
    message: '',
    lock: (message = 'Đang xử lý giao dịch...') => set({ isLocked: true, message }),
    unlock: () => set({ isLocked: false, message: '' }),
}));