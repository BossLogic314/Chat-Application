import { create } from "zustand";

const messageStore = (set) => ({
    messages: [],
    addToMessages: (newMessage) => set((state) => ({messages: [...state.messages, newMessage]})),
    setMessages: (newMessages) => set({messages: newMessages})
});

export const useMessagesStore = create(messageStore);