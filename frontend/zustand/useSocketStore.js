import { create } from "zustand";

const socketStore = (set) => ({
    socket: null,
    setSocket: async (newSocket) => set({socket: newSocket})
});

export const useSocketStore = create(socketStore);