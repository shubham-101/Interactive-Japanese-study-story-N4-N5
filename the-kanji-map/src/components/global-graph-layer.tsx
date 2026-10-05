"use client";

import { useMediaQuery } from "react-responsive";
import { useActiveGraphData } from "@/lib/active-graph-data";
import { DESKTOP_GRAPH_LAYER } from "@/lib/graph-layout";
import { Graphs } from "./graphs";

// Rendered in the root layout. It overlays the graph cell of the [id] page
// (bottom row, right 60%, below the 330px top row) and stays mounted across
// kanji navigations, so the canvas survives and the graph morphs in place
// instead of being rebuilt for every new page. Mobile keeps its graph in the
// page's tab, so this layer is desktop-only.
export function GlobalGraphLayer() {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const data = useActiveGraphData();

  if (isMobile || !data) {
    return null;
  }

  const big =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).get("graph") === "big" ||
      new URLSearchParams(window.location.search).get("panel") === "graph");

  const panel =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("panel")
      : null;

  // In single-panel mode the page leaves no graph cell for this layer to
  // overlay; only panel=graph (big graph) keeps it.
  if (panel && panel !== "graph") {
    return null;
  }

  return (
    <div
      className={
        big
          ? "fixed inset-0 z-50 overflow-hidden bg-background"
          : DESKTOP_GRAPH_LAYER
      }
    >
      <Graphs kanjiInfo={data.kanjiInfo} graphData={data.graphData} />
    </div>
  );
}
