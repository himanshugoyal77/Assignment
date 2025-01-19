import { useEffect, useState } from "react";
import { gapi } from "gapi-script";

const useGoogleApi = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeGapi = () => {
      gapi.load("client:auth2", () => {
        gapi.client
          .init({
            apiKey: process.env.NEXT_PUBLIC_API_KEY,
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
            scope: "https://www.googleapis.com/auth/calendar.readonly",
          })
          .then(() => {
            setIsInitialized(true);
          })
          .catch((error: any) => {
            console.log("Error initializing GAPI client", error);
          });
      });
    };

    initializeGapi();
  }, []);

  const listEvents = async () => {
    if (!isInitialized) {
      console.log("GAPI client not initialized");
      return [];
    }

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
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

  return { listEvents, isInitialized };
};

export default useGoogleApi;
