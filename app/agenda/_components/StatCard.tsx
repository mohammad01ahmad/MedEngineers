import type { LucideIcon } from "lucide-react";

/* ─── STAT CARD COMPONENT ─── */
export default function StatCard({ value, label, accentColor, icon: Icon }: { value: string; label: string; accentColor: string; icon: LucideIcon }) {
    return (
        <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 md:p-6 overflow-hidden group hover:border-white/[0.15] transition-all duration-300">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[60px] opacity-[0.06] ${accentColor}`} />
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-white/[0.06]`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${accentColor.replace('bg-', 'text-')}`} />
                </div>
                <div>
                    <div className={`text-2xl md:text-3xl font-extrabold tracking-tight font-mono ${accentColor.replace('bg-', 'text-')}`}>
                        {value}
                    </div>
                    <div className="text-xs md:text-sm text-gray-400 mt-0.5">{label}</div>
                </div>
            </div>
        </div>
    );
}