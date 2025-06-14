"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextData {
  userName: string;
  setUserName: (name: string) => void;
  userImage: string | null;
  setUserImage: (img: string | null) => void;
}

const UserContext = createContext<UserContextData | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);

  return (
    <UserContext.Provider
      value={{ userName, setUserName, userImage, setUserImage }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
