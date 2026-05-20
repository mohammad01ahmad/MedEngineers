import { AgendaItem } from "../_utils/agenda_types";
import { MapPin, Clock } from "lucide-react";
import { categoryColors } from "../_utils/agenda_data";

/* ─── AGENDA CARD (LIST VIEW) ─── */
export default function AgendaCardList({ item }: { item: AgendaItem }) {
    const IconComponent = item.icon;
    const catColor = categoryColors[item.category] || "text-gray-400 bg-gray-400/10 border-gray-400/20";

    return (
        <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 md:p-6 flex flex-row items-start gap-4 md:gap-8 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05] group">

            {/* Date/Time Left side */}
            <div className="flex flex-col items-center shrink-0 w-[60px] md:w-[90px]">
                <div className="text-sm md:text-lg font-bold font-mono text-white text-center">{item.time}</div>
                {item.duration && (
                    <div className="text-[10px] md:text-xs text-gray-500 font-mono mt-0.5">{item.duration}</div>
                )}
                <div className={`mt-3 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 border border-white/10 bg-white/[0.04]`}>
                    <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${item.color.replace('bg-', 'text-')}`} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base md:text-lg font-semibold text-white">{item.title}</h3>
                    <span className={`inline-flex items-center text-[9px] md:text-[10px] font-semibold px-2 py-0.5 rounded border ${catColor}`}>
                        {item.category}
                    </span>
                </div>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-2 line-clamp-2">{item.description}</p>
                {item.location && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            <MapPin className="w-3 h-3 text-[#007b8a]" />
                            <span className="font-semibold tracking-wide uppercase">{item.location}</span>
                        </span>
                        {item.endTime && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="font-mono">{item.time} – {item.endTime}</span>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Time badge (desktop) */}
            <div className="hidden lg:flex items-center text-sm font-bold text-[#007b8a] bg-[#007b8a]/10 border border-[#007b8a]/20 px-4 py-1.5 rounded-full whitespace-nowrap shrink-0">
                <Clock className="w-3.5 h-3.5 mr-2" />
                {item.time}{item.endTime ? ` – ${item.endTime}` : ""}
            </div>
        </div>
    );
}