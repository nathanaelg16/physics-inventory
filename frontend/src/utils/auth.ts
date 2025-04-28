import {createContext} from "react";

export enum AccessLevel {
    Viewer = 0,
    Maintainer = 1,
    Administrator = 2
}

export interface AuthContextType {
    isAuthenticated: boolean
    setAuthenticated: (isAuthenticated: boolean) => void
    accessLevel: AccessLevel
    setAccessLevel: (accessLevel: AccessLevel) => void
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setAuthenticated: () => {},
    accessLevel: AccessLevel.Viewer,
    setAccessLevel: () => {}
})