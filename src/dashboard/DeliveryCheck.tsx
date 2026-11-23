"use client";

import { useState, useTransition } from "react";
import { checkDelivery } from "./push-actions";
import { btnSmall } from "./ui";

type Labels = { check: string; delivered: string; failedN: string; waiting: string; reason: string };

// One history row's "Check delivery": asks Expo whether Apple/Google took the message and shows the real error if not.
export function DeliveryCheck({ id, l }: { id: string; l: Labels }) {
  const [r, setR] = useState<Awaited<ReturnType<typeof checkDelivery>> | null>(null);
  const [pending, start] = useTransition();
  if (!r)
    return (
      <button type="button" disabled={pending} onClick={() => start(async () => setR(await checkDelivery(id)))} className={btnSmall}>
        {l.check}
      </button>
    );
  return (
    <span className="text-[13px]">
      {l.delivered.replace("{n}", String(r.delivered))} · {l.failedN.replace("{n}", String(r.failed))}
      {r.waiting > 0 && ` · ${l.waiting.replace("{n}", String(r.waiting))}`}
      {r.error && <span className="block text-d-muted" dir="ltr">{l.reason}: {r.error}</span>}
    </span>
  );
}
