import { useEffect, useState } from "react";

export type Route =
  | { page: "home" }
  | { page: "hall"; id: string }
  | { page: "question"; id: string }
  | { page: "playground"; id?: string }
  | { page: "progress" }
  | { page: "stories" };

export const href = {
  home: "#",
  hall: (id: string) => `#hall/${id}`,
  question: (id: string) => `#q/${id}`,
  play: (id?: string) => (id ? `#play/${id}` : "#play"),
  progress: "#progress",
  stories: "#stories",
};

export function parseRoute(hash: string): Route {
  const [page, id] = hash.replace(/^#/, "").split("/");
  switch (page) {
    case "hall": return id ? { page: "hall", id } : { page: "home" };
    case "q": return id ? { page: "question", id } : { page: "home" };
    case "play": return { page: "playground", id: id || undefined };
    case "progress": return { page: "progress" };
    case "stories": return { page: "stories" };
    default: return { page: "home" };
  }
}

export function useRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  return parseRoute(hash);
}
