import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import {useMemo} from "react";

export type Message = {
    role: 'user' | 'assistant';
    content: string;
};

type ChatState = {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    loadMessages: () => Promise<void>;
    clearMessages: () => void;
};

const STORAGE_KEY = 'chatMessages';

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    setMessages: async (messages) => {
        set({ messages });
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(messages));
    },
    addMessage: async (message) => {
        const updated = [...get().messages, message];
        set({ messages: updated });
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));
    },
    loadMessages: async () => {
        const json = await SecureStore.getItemAsync(STORAGE_KEY);
        if (json) {
            console.log("idem parsnut ", json);
            const parsed = JSON.parse(json) as Message[];

            set({ messages: parsed });
        }
    },
    clearMessages: async () => {
        set({ messages: [] });
        await SecureStore.deleteItemAsync(STORAGE_KEY);
    },
}));
