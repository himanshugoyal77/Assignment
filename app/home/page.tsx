"use client";

import {
  useSession,
  signIn,
  signOut,
  getSession,
  getProviders,
  getCsrfToken,
} from "next-auth/react";
import useGoogleApi from "@/hooks/useGoogleApi";
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
import { gapi } from "gapi-script";
import axios from "axios";

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
        console.log("filtervalue", filterValue);
        const rowDate = new Date(row.getValue(columnId));
        const filterDate = new Date(filterValue);

        // Include the row if its date is after the filter date
        return rowDate > filterDate;
      },
    },
    {
      accessorKey: "time",
      header: "Time",
    },
    {
      accessorKey: "organizer",
      header: "Organizer",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];
  const { data: session, status } = useSession();
  const router = useRouter();
  const { listEvents, isInitialized } = useGoogleApi();
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<CalenderEventType[]>([]);
  const [events, setEvents] = useState<CalenderEventType[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
  }, [status]);

  const getEvents = async (token: string) => {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const events = response.data.items.map((event: any) => {
        return {
          title: event.summary,
          date: event.start.dateTime,
          time: event.start.timeZone,
          organizer: event.organizer.email,
          status: event.status,
        };
      });
      setEvents(events);
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getSession().then((session) => {
      getEvents((session as any)?.accessToken);
    });
  }, [isInitialized]);

  if (status === "loading" || loading) {
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
          />
          <p
            className="mx-auto text-center mt-6 bg-slate-100 text-black py-2
          w-[200px] 
          cursor-pointer
          rounded-lg
          hover:bg-[#4B35EA]
          hover:text-white
          text-sm font-bold
          shadow-md flex items-center gap-2 justify-center
          transition-all duration-300 ease-in-out
          "
          >
            <HardDriveDownload size={14} />
            <CsvDownloader
              filename="myfile"
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
            />
          </p>
        </>
      ) : (
        <button onClick={() => signIn("google")}>Sign In</button>
      )}
    </div>
  );
};

export default Home;
