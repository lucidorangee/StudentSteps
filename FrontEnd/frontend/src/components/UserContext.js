import React, { createContext, useState, useContext } from 'react';

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// Create a custom hook for easier access
export const useUser = () => useContext(UserContext);
