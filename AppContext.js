import React from 'react';

export const AppContext = React.createContext({
  user: '',
  setUser: () => {},
});
