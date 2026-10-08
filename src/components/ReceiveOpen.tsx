"use client";

import { useSyncExternalStore } from "react";

const TOKEN = /^[\w-]{8,64}$/;
const subscribe = () => () => {};
// null on the server and before the page loads, "" when the token is missing or invalid.
const read = () => {
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  return TOKEN.test(token) ? token : "";
};

// Reads ?token=… in the browser, so the page itself stays static.
export function ReceiveOpen({ body, open, invalid }: { body: string; open: string; invalid: string }) {
  const token = useSyncExternalStore(subscribe, read, () => null);
  if (token === "") return <p className="mt-8 text-lg leading-8 text-muted">{invalid}</p>;
  return (
    <>
      <p className="mt-8 text-lg leading-8 text-muted">{body}</p>
      {token && (
        <a
          href={`bestim://receive?token=${token}`}
          className="mt-6 inline-block rounded-full bg-lime px-8 py-4 text-lg font-semibold text-ink shadow-glow transition-transform hover:-translate-y-0.5"
        >
          {open}
        </a>
      )}
    </>
  );
}
