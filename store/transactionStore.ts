import { create } from 'zustand'

interface TransactionState {
    isPending: boolean
    message: string
    txHash: string | null
    refreshTrigger: number
    setPending: (isPending: boolean, message?: string, txHash?: string | null) => void
    triggerRefresh: () => void
}

export const useTransactionStore = create<TransactionState>((set) => ({
    isPending: false,
    message: '',
    txHash: null,
    refreshTrigger: 0,
    setPending: (isPending, message = '', txHash = null) => set({ isPending, message, txHash: isPending ? txHash : null }),
    triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}))
