import { Suspense } from "react";
import { MessagesInboxSplit } from "@/components/messages/messages-inbox-split";

export default function MessagesPage() {
  return (
    <div className="-mx-4 -mt-1 min-h-0 md:-mx-6 lg:-mx-8">
      <Suspense
        fallback={
          <div className="text-muted-foreground flex min-h-[50vh] items-center justify-center text-sm">
            Loading messages…
          </div>
        }
      >
        <MessagesInboxSplit />
      </Suspense>
    </div>
  );
}
