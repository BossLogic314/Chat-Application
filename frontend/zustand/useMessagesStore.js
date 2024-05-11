import { create } from "zustand";
import { useCurrentChatNameStore } from "./useCurrentChatNameStore";
import { useUsernameStore } from "./useUsernameStore";

const messageStore = (set) => ({
    messages: [],
    setMessages: (newMessages) => set({messages: newMessages}),
    addToMessages: (newMessage) => {

        const currentChatName = useCurrentChatNameStore.getState().currentChatName;
        const username = useUsernameStore.getState().username;

        // Deciding whether the received message belongs to the chat currently opened by the user
        let toAddMessage = (newMessage.to == username && newMessage.from == currentChatName) || (currentChatName == newMessage.to);

        if (toAddMessage) {
            set((state) => ({messages: [...state.messages, newMessage]}));
        }
    }
});

export const useMessagesStore = create(messageStore);