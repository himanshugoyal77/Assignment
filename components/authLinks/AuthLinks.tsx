"use client";
import Link from "next/link";
import styles from "./authLinks.module.css";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AuthLinks = () => {
  const [open, setOpen] = useState(false);

  const { status, data } = useSession();
  const router = useRouter();

  console.log(status);

  return (
    <>
      {status === "unauthenticated" ? (
        <span></span>
      ) : (
        <span className={styles.link} onClick={() => signOut()}>
          Logout
        </span>
      )}
      <div className={styles.burger} onClick={() => setOpen(!open)}>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
        <div className={styles.line}></div>
      </div>
      {open && (
        <div className={styles.responsiveMenu}>
          <Link href="https://himanshu-goyal.netlify.app">Contact</Link>
          {status === "unauthenticated" ? (
            <span></span>
          ) : (
            <span
              onClick={() => {
                signOut();
                localStorage.removeItem("token");
                router.push("/");
              }}
            >
              Logout
            </span>
          )}
        </div>
      )}
    </>
  );
};

export default AuthLinks;
