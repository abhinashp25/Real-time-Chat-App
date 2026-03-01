import {create} from 'zustand'

export const useAuthStore = create((set) => ({
    authUser: {name: "Abhiash", _id: 2, age: 20},
    isLoggedIn: false,
    isLoading: false,

    login: () => {
        console.log("Just Logged in...");
        set({isLoggedIn: true, isLoading: true});
    },
}));