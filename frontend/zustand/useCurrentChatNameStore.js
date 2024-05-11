import { create } from "zustand";

const currentChatNameStore = (set) => ({
    currentChatName: '',
    setCurrentChatName: (newChatName) => set({currentChatName: newChatName})
});

export const useCurrentChatNameStore = create(currentChatNameStore);