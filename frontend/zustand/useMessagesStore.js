import { create } from "zustand";
import { useCurrentChatStore } from "./useCurrentChatStore";
import { useUsernameStore } from "./useUsernameStore";

const messageStore = (set) => ({
    readMessages: [],
    setReadMessages: (newReadMessages) => set({readMessages: newReadMessages}),
    unreadMessages: [],
    setUnreadMessages: (newUnreadMessages) => set({unreadMessages: newUnreadMessages}),
    addToMessages: (newMessage) => {

        const currentChatName = useCurrentChatStore.getState().currentChatName;
        const username = useUsernameStore.getState().username;

        // Deciding whether the received message belongs to the chat currently opened by the user
        let toAddMessage = (newMessage.to == username && newMessage.from == currentChatName) || (currentChatName == newMessage.to);

        if (toAddMessage) {

            // If the message was sent by the current user, all 'unread' messages need to be marked as 'read'
            if (newMessage.from == username) {
                set((state) => ({readMessages: [...state.readMessages, ...state.unreadMessages, newMessage]}));
                set({unreadMessages: []});
            }
            else {
                // If the message was received by the current user, add the received message to the list of unread messages
                set((state) => ({unreadMessages: [...state.unreadMessages, newMessage]}));
            }
        }
    }
});

export const useMessagesStore = create(messageStore);