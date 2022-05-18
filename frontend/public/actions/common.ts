import { action } from 'typesafe-actions';

enum ActionType {
  SetCreateProjectMessage = 'setCreateProjectMessage',
  SetClusterID = 'setClusterID',
  SetUser = 'setUser',
  SetConsoleLinks = 'setConsoleLinks',
  SetIdToken = 'setIdToken',
  SetRefreshToken = 'setRefreshToken',
}

export const setClusterID = (clusterID: string) => action(ActionType.SetClusterID, { clusterID });
export const setUser = (user: any) => action(ActionType.SetUser, { user });
export const setCreateProjectMessage = (message: string) => action(ActionType.SetCreateProjectMessage, { message });
export const setConsoleLinks = (consoleLinks: string[]) => action(ActionType.SetConsoleLinks, { consoleLinks });
export const setIdToken = (idToken: string) => action(ActionType.SetIdToken, { idToken });
export const setRefreshToken = (refreshToken: string) => action(ActionType.SetRefreshToken, { refreshToken });
