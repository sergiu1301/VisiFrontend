import React, { createContext, useContext, useEffect, useState } from "react";
import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  HttpTransportType,
} from "@microsoft/signalr";
import { googleLogout } from "@react-oauth/google";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "./UserProfileProvider"; // Importă contextul profilului utilizatorului

interface WebSocketContextType {
  connection: HubConnection | null;
  setAuthenticated: (auth: boolean) => void;
  logout: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const { setUserProfile, fetchUserProfile } = useUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (token) {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated && !connection) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`${apiUrl}/connecthub`, {
          accessTokenFactory: () => localStorage.getItem("jwtToken") || "",
          transport: HttpTransportType.WebSockets,
          skipNegotiation: true,
        })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);
    }
  }, [authenticated, connection]);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR Hub");

          if (connection.state === HubConnectionState.Connected) {
            connection
              .invoke("AddToGroupConnection")
              .then(() => {
                console.log(`Joined user group`);

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
              })
              .catch((error) =>
                console.error("Error joining user group: ", error),
              );
          }

          connection.on("ReceiveMessageConnection", (message) => {
            console.log("Message from ConnectHub:", message);
            if (message === "blocked") {
              logout();
            }
          });
        })
        .catch((error) => console.log("SignalR Hub connection error: ", error));

      return () => {
        if (connection.state === HubConnectionState.Connected) {
          connection
            .stop()
            .then(() => console.log("Disconnected from SignalR Hub"));
        }
      };
    }
  }, [connection]);

  const setAuthenticatedUser = (auth: boolean) => {
    setAuthenticated(auth);
    if (auth && connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR Hub after re-authentication");
          if (connection.state === HubConnectionState.Connected) {
            connection
              .invoke("AddToGroupConnection")
              .then(() => console.log(`Joined user group`))
              .catch((error) =>
                console.error("Error joining user group: ", error),
              );

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
          }
        })
        .catch((error) => console.log("SignalR Hub connection error: ", error));
    }
  };

  const logout = () => {
    if (connection && connection.state === HubConnectionState.Connected) {
      connection
        .invoke("RemoveFromGroupConnection")
        .then(() => console.log(`Left user group`))
        .catch((error) => console.error("Error leaving user group: ", error))
        .finally(() => {
          connection.stop().then(() => {
            console.log("Disconnected from SignalR Hub");
            localStorage.removeItem("jwtToken");
            googleLogout();
            queryClient.removeQueries("userProfile");
            navigate("/");
            setConnection(null); // Reset connection to allow reinitialization
          });
        });
      setAuthenticated(false);
    } else {
      setAuthenticated(false);
      localStorage.removeItem("jwtToken");
      googleLogout();
      queryClient.removeQueries("userProfile");
      navigate("/");
      if (connection) {
        connection.stop().then(() => {
          setConnection(null); // Reset connection to allow reinitialization
        });
      }
    }
  };

  return (
    <WebSocketContext.Provider
      value={{ connection, setAuthenticated: setAuthenticatedUser, logout }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
