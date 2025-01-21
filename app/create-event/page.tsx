"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TraingleLoader from "@/components/loader/TraingleLoader";
import { DateTimePicker } from "@/components/DateTimePicker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

function CreateEventPage({ mutate }: { mutate: () => void }) {
  const router = useRouter();
  const [start, setStart] = useState<Date | undefined>(new Date());
  const [end, setEnd] = useState<Date | undefined>(new Date());
  const [eventName, setEventName] = useState("");
  const { data: session, status } = useSession();
  const [eventDescription, setEventDescription] = useState("");

  useEffect(() => {
    if (
      status !== "authenticated" ||
      (typeof window !== "undefined" && localStorage.getItem("token") === null)
    ) {
      router.push("/");
    }
  }, []);

  if (status === "loading") {
    return <TraingleLoader />;
  }

  async function createCalendarEvent() {
    console.log("Creating calendar event");
    const event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: start?.toISOString(), // Date.toISOString() ->
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // America/Los_Angeles
      },
      end: {
        dateTime: end?.toISOString(), // Date.toISOString() ->
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // America/Los_Angeles
      },
    };
    await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"), // Access token for google
        },
        body: JSON.stringify(event),
      }
    )
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        alert("Event created, check your Google Calendar!");
      });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Event</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px] w-96">
        <DialogHeader>
          <DialogTitle>Hello, {session?.user.name} 👋</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar!
          </DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col items-center justify-center gap-2">
          {session ? (
            <>
              <div className="w-full py-3 px-5">
                <p>Select Start date :</p>
                <DateTimePicker date={start} setDate={setStart} />
                <p>End of your event</p>
                <DateTimePicker date={end} setDate={setEnd} />
                <p>Event name</p>
                <Input
                  type="text"
                  required
                  onChange={(e) => setEventName(e.target.value)}
                />
                <p>Event description</p>
                <Input
                  type="text"
                  onChange={(e) => setEventDescription(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <button onClick={() => signIn()}>Sign In With Google</button>
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={() => {
                // validate the form
                if (!start || !end || !eventName) {
                  alert("Please fill all the fields");
                  return;
                }

                createCalendarEvent().then(() => {
                  mutate();
                });
              }}
            >
              Create Calendar Event
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateEventPage;
