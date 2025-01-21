"use client";
import Link from "next/link";
import styles from "./authLinks.module.css";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";

const AuthLinks = () => {
  const [open, setOpen] = useState(false);

  const { status, data } = useSession();
  const router = useRouter();

  return (
    <>
      {status === "unauthenticated" ? (
        <span></span>
      ) : (
        <Button className={styles.link} onClick={() => signOut()}>
          Logout
        </Button>
      )}
      <div className={styles.burger} onClick={() => setOpen(!open)}>
        {!open ? <Menu size={24} /> : <X size={24} />}
      </div>
      {open && (
        <div className={styles.responsiveMenu}>
          <Button className="w-28">
            {" "}
            <Link href="https://himanshu-goyal.netlify.app">Contact</Link>
          </Button>
          {status === "unauthenticated" ? (
            <span></span>
          ) : (
            <Button
              className="w-28"
              onClick={() => {
                signOut();
                localStorage.removeItem("token");
                router.push("/");
              }}
            >
              Logout
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default AuthLinks;
