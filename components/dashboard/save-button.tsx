"use client";
import { useFormStatus } from "react-dom";
export function SaveButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="button" disabled={pending}>
      {pending ? "Saving…" : label} ↗
    </button>
  );
}
