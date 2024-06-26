import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const currentChatStore = (set) => ({
    currentChatName: '',
    setCurrentChatName: (newChatName) => set({currentChatName: newChatName}),
    currentChat: {},
    setCurrentChat: (newCurrentChat) => set({currentChat: newCurrentChat})
});

export const useCurrentChatStore = create(
    persist(
        currentChatStore,
        {
            name: 'current-chat',
            storage: createJSONStorage(() => sessionStorage)
        }
    )
);