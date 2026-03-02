import { useState, useCallback } from "react";

export type View = "inbox" | "today" | "upcoming" | "projects" | "areas" | "logbook" | "search";
export type FocusZone = "sidebar" | "main";

const viewOrder: View[] = ["inbox", "today", "upcoming", "projects", "areas", "logbook", "search"];

const viewLabels: Record<View, string> = {
  inbox: "Inbox",
  today: "Today",
  upcoming: "Upcoming",
  projects: "Projects",
  areas: "Areas",
  logbook: "Logbook",
  search: "Search",
};

export function useNavigation() {
  const [view, setView] = useState<View>("inbox");
  const [focus, setFocus] = useState<FocusZone>("main");

  const toggleFocus = useCallback(() => {
    setFocus((f) => (f === "sidebar" ? "main" : "sidebar"));
  }, []);

  const nextView = useCallback(() => {
    setView((v) => {
      const idx = viewOrder.indexOf(v);
      return viewOrder[(idx + 1) % viewOrder.length];
    });
  }, []);

  const prevView = useCallback(() => {
    setView((v) => {
      const idx = viewOrder.indexOf(v);
      return viewOrder[(idx - 1 + viewOrder.length) % viewOrder.length];
    });
  }, []);

  const jumpToView = useCallback((num: number) => {
    if (num >= 1 && num <= viewOrder.length) {
      setView(viewOrder[num - 1]);
      setFocus("main");
    }
  }, []);

  return {
    view,
    setView,
    focus,
    setFocus,
    toggleFocus,
    nextView,
    prevView,
    jumpToView,
    viewOrder,
    viewLabels,
  };
}
