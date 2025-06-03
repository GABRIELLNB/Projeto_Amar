"use client";

import React, { useState, useEffect } from "react";
import SidebarMenu from "./sidebar-menu"; // caminho do seu componente SidebarMenu

// Hook para ler userType e userName do localStorage
function useUser() {
  const [user, setUser] = useState<{ userType?: string; userName?: string }>({});

  useEffect(() => {
    const userType = localStorage.getItem("user_type") || undefined;
    const userName = localStorage.getItem("user_name") || undefined;
    setUser({ userType, userName });
  }, []);

  return user;
}

export default function Layout() {
  const { userType, userName } = useUser();

  if (!userType || !userName) {
    return <div>Carregando...</div>;
  }

  return (
    <SidebarMenu
      userType={userType as "profissional" | "estagiario" | "outro"}
      userName={userName}
      activeItem="Menu"
    />
  );
}
