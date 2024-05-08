import { create } from "zustand";
import {devtools, persist} from "zustand/middleware";

const usernameStore = (set) => ({
    username: '',
    setUsername: (newUsername) => set({username: newUsername})
});

export const useUsernameStore = create(
    devtools(
        persist(usernameStore, {
            name: "username",
        })
    )
);