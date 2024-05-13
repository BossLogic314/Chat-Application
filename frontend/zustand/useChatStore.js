import { create } from "zustand";
import { useUsernameStore } from "./useUsernameStore";

const chatsStore = (set, get) => ({
    chats: [],
    setChats: (newChats) => set({chats: newChats}),
    pushChatToTop: (receivedMessage) => {

        const username = useUsernameStore.getState().username;
        const chatName = receivedMessage.from == username ? receivedMessage.to : (
            receivedMessage.to == username ? receivedMessage.from : receivedMessage.to
        );

        const currentChats = get().chats;
        let newChats = [];
        let chatToPush = null;

        for (let i = 0; i < currentChats.length; ++i) {

            if (currentChats[i].name == chatName) {
                chatToPush = currentChats[i];
                continue;
            }

            newChats.push(currentChats[i]);
        }

        // The chat to push may not be in the list if the user has a filter in place
        if (chatToPush) {
            chatToPush.lastMessage.message = receivedMessage.from + ":" + receivedMessage.message;
            get().setChats([chatToPush, ...newChats]);
        }
    }
});

export const useChatsStore = create(chatsStore);