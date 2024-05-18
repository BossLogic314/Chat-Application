import { create } from "zustand";

const displayPictureStore = (set) => ({
    displayPicture: '',
    setDisplayPicture: async (newDisplayPicture) => set({displayPicture: newDisplayPicture})
});

export const useDisplayPictureStore = create(displayPictureStore);