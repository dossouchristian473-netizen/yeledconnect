"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UnreadBadge({ userId, inline = false }: { userId: string; inline?: boolean }) {
  const [count, setCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function load() {
      const { count: c } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .is("read_at", null);
      if (active) setCount(c ?? 0);
    }

    load();
    const interval = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId, supabase]);

  if (count === 0) return null;

  return (
    <span
      className={`${
        inline ? "relative" : "absolute -top-1 -right-1.5"
      } min-w-[16px] h-[16px] rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
