import { create } from "zustand";

const popUpDisplayPictureStore = (set) => ({
    popUpChatDisplayPicture: null,
    setPopUpDisplayPicture: (newChatName) => set({popUpDisplayPicture: newChatName})
});

export const usePopUpDisplayPictureStore = create(popUpDisplayPictureStore);