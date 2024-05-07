import { create } from "zustand";

const createGroupChatStore = (set) => ({
    createGroupChat: false,
    setCreateGroupChat: (updatedValue) => {
        set({createGroupChat: updatedValue});
    }
});

export const useCreateGroupChatStore = create(createGroupChatStore);