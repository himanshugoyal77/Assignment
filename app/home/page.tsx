"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import useGoogleApi from "@/hooks/useGoogleApi";
import { useEffect, useMemo, useState } from "react";
import TraingleLoader from "@/components/loader/TraingleLoader";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { CalenderEventType } from "@/types/Event";
import { CalendarEventTable } from "@/components/table/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import CsvDownloader from "react-csv-downloader";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

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
    cell: ({ row }) => <div className="lowercase">{row.getValue("date")}</div>,
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

const Home = () => {
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

  useEffect(() => {
    listEvents().then((fetchedEvents: any) => {
      console.log(fetchedEvents);
      setLoading(true);
      fetchedEvents = fetchedEvents.map((event: any) => {
        return {
          id: event.id,
          title: event.summary,
          date: new Date(event.start.dateTime).toLocaleDateString(),
          time: new Date(event.start.dateTime).toLocaleTimeString(),
          organizer: event.organizer.email,
          status: event.status,
        };
      });
      setEvents(fetchedEvents);
      setLoading(false);
    });
  }, [isInitialized]);

  if (status === "loading" || loading) {
    return <TraingleLoader />;
  }

  const handleExportSelectedRows = (data: []) => {
    setSelectedRows(data);
  };

  console.log("selectedRows", selectedRows);

  return (
    <div className="h-full pb-12 md:pb-0">
      {session ? (
        <>
          <CalendarEventTable
            data={events}
            columns={columns}
            setSelectedRows={setSelectedRows}
          />
          <p
            className="mx-auto text-center mt-6 bg-[#4B35EA] text-white py-3
          w-[200px] 
          cursor-pointer
          rounded-lg
          hover:bg-purple-100
          hover:text-black
          shadow-md
          "
          >
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
              datas={selectedRows}
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
