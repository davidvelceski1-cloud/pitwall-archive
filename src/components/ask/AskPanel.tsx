"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Maximize2, X } from "lucide-react";
import { askStore, useAsk } from "@/lib/ask-store";
import { AskChat } from "./AskChat";

/** Slide-over assistant available on every page. */
export function AskPanel() {
  const { open } = useAsk();
  return (
    <Dialog.Root open={open} onOpenChange={(o) => (o ? askStore.open() : askStore.close())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] data-[state=open]:animate-[rise_200ms_ease-out]" />
        <Dialog.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col border-l border-line bg-bg shadow-lift outline-none data-[state=open]:animate-[rise_220ms_ease-out]"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <Dialog.Title className="font-medium text-ink">Ask the Archive</Dialog.Title>
            <div className="flex items-center gap-1">
              <Link href="/ask" onClick={() => askStore.close()} className="rounded-full p-2 text-muted-strong hover:text-ink" aria-label="Open full-page view">
                <Maximize2 className="size-4" strokeWidth={1.5} />
              </Link>
              <Dialog.Close className="rounded-full p-2 text-muted-strong hover:text-ink" aria-label="Close">
                <X className="size-4" strokeWidth={1.5} />
              </Dialog.Close>
            </div>
          </div>
          <AskChat variant="panel" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
