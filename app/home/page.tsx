"use client";
import { ToastContainer, toast } from "react-toastify";
import { useSession, getSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import TraingleLoader from "@/components/loader/TraingleLoader";
import { useRouter } from "next/navigation";
import { ColumnDef, sortingFns } from "@tanstack/react-table";
import { CalenderEventType } from "@/types/Event";
import { CalendarEventTable } from "@/components/table/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import CsvDownloader from "react-csv-downloader";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, HardDriveDownload, SortAsc } from "lucide-react";
import axios from "axios";
import useSWR from "swr";

const Home = () => {
  const columns: ColumnDef<CalenderEventType, string>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      size: 270,
    },
    {
      id: "date",
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">
          {new Date(row.getValue("date")).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
      meta: {
        filterKey: "date",
      },
      filterFn: (row, columnId, filterValue) => {
        const rowDate = new Date(row.getValue(columnId));
        const filterDate = new Date(filterValue);

        // Include the row if its date is after the filter date
        return rowDate > filterDate;
      },
    },
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ row }) => {
        const date = new Date(row.getValue("time"));
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const amPm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, "0");

        return (
          <div className="lowercase">
            {hours}:{formattedMinutes} {amPm}
          </div>
        );
      },
    },
    {
      accessorKey: "organizer",

      cell: ({ row }) => {
        const email: string = row.getValue("organizer");
        return <a href={`mailto:${email}`}>{email}</a>;
      },
      header: "Organizer",
      maxSize: 200,
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<CalenderEventType[]>([]);
  const [events, setEvents] = useState<CalenderEventType[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
  }, [status]);

  const getEvents = async (url: string) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      const events = response.data.items.map((event: any) => {
        return {
          title: event.summary,
          date: event.start.dateTime,
          time: event.start.dateTime,
          organizer: event.organizer.email,
          status: event.status,
        };
      });
      setEvents(events);
    } catch (error) {
      console.log("error", error);
    }
  };

  const { data, mutate, isLoading } = useSWR(
    (session as any)?.accessToken
      ? "https://www.googleapis.com/calendar/v3/calendars/primary/events"
      : null,
    getEvents
  );

  useEffect(() => {
    getSession().then((session) => {
      localStorage.setItem("token", (session as any)?.accessToken);
      mutate();
    });
  }, []);

  if (status === "loading" || isLoading) {
    return <TraingleLoader />;
  }

  return (
    <div className="pb-12 md:pb-0">
      {session ? (
        <>
          <CalendarEventTable
            data={events}
            columns={columns}
            setSelectedRows={setSelectedRows}
            mutate={mutate}
          />

          <CsvDownloader
            filename="MyCalendarEvents"
            extension=".csv"
            columns={[
              { id: "title", displayName: "Title" },
              { id: "date", displayName: "Date" },
              { id: "time", displayName: "Time" },
              { id: "organizer", displayName: "Organizer" },
              { id: "status", displayName: "Status" },
            ]}
            datas={selectedRows.map((row) => ({
              ...row,
              date: row.date.toString(),
            }))}
            text="DOWNLOAD"
            disabled={selectedRows?.length === 0}
          >
            <Button
              onClick={() => {
                if (selectedRows?.length === 0) {
                  toast.error(
                    "Please select atleast one row to download",

                    {
                      position: "bottom-right",
                      style: {},
                    }
                  );
                }
              }}
              className={`mt-4`}
              variant={selectedRows?.length === 0 ? "outline" : "default"}
            >
              <HardDriveDownload size={14} />
              Download
            </Button>
          </CsvDownloader>
          <ToastContainer />
        </>
      ) : (
        <TraingleLoader />
      )}
    </div>
  );
};

export default Home;
