import { createContext, useContext, useState, ReactNode } from "react";

export interface HelpContextValue {
  page?: string;
  bookingId?: string;
  setContext: (ctx: { page?: string; bookingId?: string }) => void;
  openLauncher: () => void;
  closeLauncher: () => void;
  isOpen: boolean;
}

const HelpCtx = createContext<HelpContextValue | null>(null);

export function HelpProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<string | undefined>();
  const [bookingId, setBookingId] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HelpCtx.Provider
      value={{
        page,
        bookingId,
        setContext: (ctx) => {
          if (ctx.page !== undefined) setPage(ctx.page);
          if (ctx.bookingId !== undefined) setBookingId(ctx.bookingId);
        },
        openLauncher: () => setIsOpen(true),
        closeLauncher: () => setIsOpen(false),
        isOpen,
      }}
    >
      {children}
    </HelpCtx.Provider>
  );
}

export function useHelp() {
  const ctx = useContext(HelpCtx);
  if (!ctx) throw new Error("useHelp must be used inside HelpProvider");
  return ctx;
}
