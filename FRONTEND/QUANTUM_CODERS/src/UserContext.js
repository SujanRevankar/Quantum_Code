import React, { createContext, useContext, useState } from 'react';

// Create a context
const UserContext = createContext();

// Create a custom hook to use the context
export const useUserContext = () => useContext(UserContext);

// Create a provider component
export const UserProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [language, setLanguage] = useState('');

  return (
    <UserContext.Provider value={{ username, setUsername, language, setLanguage }}>
      {children}
    </UserContext.Provider>
  );
};
