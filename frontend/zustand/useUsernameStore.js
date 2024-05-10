import { create } from "zustand";

const usernameStore = (set) => ({
    username: '',
    setUsername: async (newUsername) => set({username: newUsername})
});

export const useUsernameStore = create(usernameStore);