import { useContext, useEffect, useState } from "react";
import { gapi } from "gapi-script";
import { AuthContext } from "@/context/AuthContext";

const useGoogleApi = () => {
  const { isLoggedIn, toggle } = useContext(AuthContext);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const initializeGapi = async () => {
      try {
        gapi.load("client:auth2", async () => {
          await gapi.client.init({
            apiKey: process.env.NEXT_PUBLIC_API_KEY,
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
            scope: "https://www.googleapis.com/auth/calendar",
          });

          const authInstance = gapi.auth2.getAuthInstance();
          setIsInitialized(true);

          // Update sign-in state
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
        });
      } catch (error) {
        console.log("Error initializing GAPI client", error);
      }
    };

    initializeGapi();
  }, []);

  const listEvents = async () => {
    const currentDate = new Date();
    try {
      // timeMin = last 10 years
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: currentDate.setFullYear(currentDate.getFullYear() - 10),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });
      return response.result.items || [];
    } catch (error) {
      console.log("Error fetching events", error);
      return [];
    }
  };

  const gapiSignIn = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      console.log("Signed in successfully");
      setIsInitialized(true);
      toggle();
      setIsSignedIn(true);
    } catch (error) {
      console.log("Error signing in", error);
    }
  };

  const gapiSignOut = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      console.log("Signed out successfully");
      toggle();
      setIsSignedIn(false);
    } catch (error) {
      console.log("Error signing out", error);
    }
  };

  const init = async () => {
    console.log("Initializing GAPI client");
  };

  return {
    listEvents,
    isInitialized,
    isSignedIn,
    gapiSignIn,
    gapiSignOut,
    init,
  };
};

export default useGoogleApi;
