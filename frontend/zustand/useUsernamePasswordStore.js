import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const usernamePasswordStore = (set) => ({
    loginUsername: '',
    setLoginUsername: (newLoginUsername) => set({loginUsername: newLoginUsername}),
    loginPassword: '',
    setLoginPassword: (newLoginPassword) => set({loginPassword: newLoginPassword}),
    signupUsername: '',
    setSignupUsername: (newSignupUsername) => set({signupUsername: newSignupUsername}),
    signupPassword: '',
    setSignupPassword: (newSignupPassword) => set({signupPassword: newSignupPassword}),
    cleanupStore: () => set({loginUsername: '', loginPassword: '', signupUsername: '', signupPassword: ''})
});

export const useUsernamePasswordStore = create(
    persist(usernamePasswordStore,
        {
            name: 'username-password',
            storage: createJSONStorage(() => sessionStorage)
        }
    )
);