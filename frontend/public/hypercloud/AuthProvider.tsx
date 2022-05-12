import * as React from 'react';
import { authSvc } from '@console/internal/module/auth';

export const AuthContext = React.createContext<IAuthContext>({
  authenticated: false,
  setAuthenticated: () => {},
});

export const AuthProvider = (props: AuthProviderProps) => {
  const { children, onLogin } = props;
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    if (!authSvc.isLoggedIn()) {
      onLogin && onLogin();
    }
  }, [authenticated, onLogin]);

  const contextValue = React.useMemo(
    () => ({
      authenticated,
      setAuthenticated,
    }),
    [authenticated],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export interface IAuthContext {
  authenticated: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

export interface AuthProviderProps {
  children?: React.ReactNode;
  onLogin?: () => void;
}
