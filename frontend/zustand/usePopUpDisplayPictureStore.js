import { create } from "zustand";

const popUpDisplayPictureStore = (set) => ({
    popUpDisplayPicture: null,
    setPopUpDisplayPicture: (updatedValue) => set({popUpDisplayPicture: updatedValue})
});

export const usePopUpDisplayPictureStore = create(popUpDisplayPictureStore);