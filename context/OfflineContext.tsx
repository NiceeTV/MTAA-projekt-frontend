import React, { createContext, useState, useEffect, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/* kontext pre offline stav*/
const OfflineContext = createContext<boolean | undefined>(undefined);


export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOffline, setIsOffline] = useState<boolean>(false);

    // Sledovanie zmien v pripojení k internetu
    useEffect(() => {
        const removeNetInfoSubscription = NetInfo.addEventListener((state: NetInfoState) => {
            const offline = !(state.isConnected && state.isInternetReachable); // Detekcia offline stavu
            setIsOffline(offline);
        });

        return () => removeNetInfoSubscription();
    }, []);

    return (
        <OfflineContext.Provider value={isOffline}>
            {children}
        </OfflineContext.Provider>
    );
};

/* získanie offline stavu */
export const useOffline = (): boolean => {
    const context = React.useContext(OfflineContext);
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};
