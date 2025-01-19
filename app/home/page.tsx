"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { gapi, loadAuth2 } from "gapi-script";

import ApiCalendar from "react-google-calendar-api";
let auth2 = await loadAuth2(
  gapi,
  "574529012252-am9pptu9a75m4bcnpbneotnbr68atefl.apps.googleusercontent.com",
  "https://www.googleapis.com/auth/calendar.readonly"
);

// load the config from the env


const Home = () => {
  const router = useRouter();
  const { status } = useSession();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    function start() {
      gapi.client
        .init(config)
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          setIsSignedIn(authInstance.isSignedIn.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
          console.log("authInstance", authInstance);
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
    gapi.load("client:auth2", start);
  }, [status]);

  const handleSignIn = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleSignOut = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  const listAllEvents = async () => {
    try {
      const res = await apiCalendar.handleAuthClick();

      console.log(res);

      const list = await apiCalendar.listEvents({
        timeMin: new Date().toISOString(),
        timeMax: new Date().toISOString() + 10,
        showDeleted: true,
        maxResults: 10,
        orderBy: "updated",
      });

      console.log("list all events", list);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEvents = () => {
    if (apiCalendar.sign) {
      apiCalendar
        .listEvents({
          calendarId: "primary",
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          orderBy: "startTime",
        })
        .then(({ result }) => {
          console.log("Events:", result.items);
          // Process and display events as needed
        })
        .catch((error) => {
          console.error("Error fetching events", error);
        });
    } else {
      console.log("User is not signed in");
    }
  };

  const getCalendars = () => {
    apiCalendar.handleAuthClick().then((res) => {
      console.log(res);
    });
  };

  return (
    <div>
      {isSignedIn ? (
        <button onClick={handleSignOut}>Sign Out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
      {isSignedIn && <CalendarEvents />}
    </div>
  );
};

function CalendarEvents() {
  const [events, setEvents] = useState([]);

  const fetchEvents = () => {
    console.log("fetching events");
    apiCalendar
      .listEvents({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      })
      .then(({ result }) => {
        console.log("Events:", result);
        setEvents(result.items);
      })
      .catch((error) => {
        console.error("Error fetching events", error);
      });
  };

  return (
    <ul>
      {events.map((event: any) => (
        <li key={event.id}>
          {event.summary} ({event.start.dateTime})
        </li>
      ))}

      <button onClick={fetchEvents}>Click me</button>
    </ul>
  );
}

export default Home;
