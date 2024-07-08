import React, { createContext, useContext, useEffect, useState } from "react";

interface UserProfile {
  userId: string;
  roleName: string;
  userName: string;
  firstName: string;
  lastName: string;
  isOnline: boolean;
  email: string;
  emailConfirmed: boolean;
  roleDescription: string;
  // Adaugă alte proprietăți necesare profilului utilizatorului
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null | any) => void;
  fetchUserProfile: (token: string) => Promise<UserProfile>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined,
);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL;
  const fetchUserProfile = async (token: string): Promise<UserProfile> => {
    const response = await fetch(`${apiUrl}/api/v1/user`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    return await response.json();
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      fetchUserProfile(token)
        .then((profile) => {
          setUserProfile(profile);
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
        });
    }
  }, []);

  return (
    <UserProfileContext.Provider
      value={{ userProfile, setUserProfile, fetchUserProfile }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};
