"use client";

import ReduxProvider from "./redux-provider";
import QueryProvider from "./query-provider";
import ToastProvider from "./toast-provider";
import { TooltipProvider } from "@/presentation/components/ui/tooltip";

export default function AppProviders({ children }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <TooltipProvider>
          <ToastProvider />
          {children}
        </TooltipProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
