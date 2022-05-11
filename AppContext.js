import React from 'react';

export const AppContext = React.createContext({
  authCred: undefined,
  user: undefined,
  setUser: () => {},
  notification: undefined,
  setNotification: () => {},
  error: undefined,
  setError: () => {},
  userBank: undefined,
  currentLocation: undefined,
  setCurrentLocation: () => {},
  savedBank: undefined,
  setSavedBank: () => {},
});
