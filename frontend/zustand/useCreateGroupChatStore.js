import { create } from "zustand";
import {devtools, persist} from "zustand/middleware";

const createGroupChatStore = (set) => ({
    createGroupChat: false,
    setCreateGroupChat: (updatedValue) => set({createGroupChat: updatedValue})
});

export const useCreateGroupChatStore = create(
    devtools(
        persist(createGroupChatStore, {
            name: "createGroupChat"
        })
    )
);