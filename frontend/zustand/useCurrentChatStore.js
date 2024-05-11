import { create } from "zustand";

const currentChatStore = (set) => ({
    currentChat: {},
    setCurrentChat: (newCurrentChat) => set({currentChat: newCurrentChat})
});

export const useCurrentChatStore = create(currentChatStore);