import React, { createContext, useEffect, useState, ReactNode } from 'react';
import {AuthService} from "@/services/auth";


interface AuthContextType {
    isLoggedIn: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const loggedIn = await AuthService.isLoggedIn(); // napr. kontrola tokenu
            setIsLoggedIn(loggedIn);

            if (!loggedIn) {
                await AuthService.removeToken();
            }
        };

        checkLoginStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};
