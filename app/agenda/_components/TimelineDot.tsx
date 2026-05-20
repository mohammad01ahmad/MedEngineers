import type { TimelineNode } from "../_utils/agenda_types";

/* ─── TIMELINE DOT ─── */
export default function TimelineDot({ node }: { node: TimelineNode }) {
    return (
        <div className="flex flex-col items-center gap-2 shrink-0 w-[95px] md:w-[120px]">
            <div className={`
        w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold font-mono
        border-2 transition-all duration-300
        ${node.status === "done"
                    ? "bg-[#007b8a] border-[#007b8a] text-white shadow-[0_0_20px_rgba(0,123,138,0.4)]"
                    : node.status === "now"
                        ? "bg-black/40 border-[#007b8a] text-[#007b8a] animate-pulse"
                        : "bg-black border-white/10 text-gray-500"
                }
      `}>
                {node.status === "done" ? "✓" : node.time}
            </div>
            <div className="text-center max-w-[80px]">
                <div className="text-[10px] md:text-xs font-medium text-gray-300 leading-tight">{node.label}</div>
                <span className={`
          inline-block mt-1 text-[9px] font-semibold px-2 py-0.5 rounded
          ${node.status === "done"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : node.status === "now"
                            ? "bg-[#007b8a]/15 text-[#007b8a]"
                            : "bg-white/5 text-gray-500"
                    }
        `}>
                    {node.status === "done" ? "Done" : node.status === "now" ? "Now" : "Upcoming"}
                </span>
            </div>
        </div>
    );
}