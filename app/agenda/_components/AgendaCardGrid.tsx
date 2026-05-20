import { AgendaItem } from "../_utils/agenda_types";
import { MapPin } from "lucide-react";
import { categoryColors } from "../_utils/agenda_data";

/* ─── AGENDA CARD (GRID VIEW) ─── */
export default function AgendaCardGrid({ item }: { item: AgendaItem }) {
    const IconComponent = item.icon;
    const catColor = categoryColors[item.category] || "text-gray-400 bg-gray-400/10 border-gray-400/20";

    return (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 md:p-6 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05] hover:-translate-y-1 group flex flex-col h-full">

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white/[0.04]`}>
                    <IconComponent className={`w-5 h-5 ${item.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-white truncate">{item.title}</h3>
                    <div className="text-[10px] md:text-xs text-gray-500 font-mono">{item.time}{item.endTime ? ` – ${item.endTime}` : ""}</div>
                </div>
            </div>

            {/* Category tag */}
            <span className={`inline-flex items-center self-start text-[9px] md:text-[10px] font-semibold px-2 py-0.5 rounded border mb-3 ${catColor}`}>
                {item.category} · {item.duration}
            </span>

            {/* Description */}
            <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3 flex-1">{item.description}</p>

            {/* Footer */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <MapPin className="w-3 h-3 text-[#007b8a] shrink-0" />
                <span className="text-[10px] font-semibold tracking-wide uppercase text-gray-500 truncate">{item.location}</span>
            </div>
        </div>
    );
}