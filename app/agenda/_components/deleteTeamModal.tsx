import { Trash2 } from "lucide-react";

/* ═══════════════════════════════════════════
   DELETE TEAM MODAL
═══════════════════════════════════════════ */
export default function DeleteTeamModal({ isOpen, onClose, onConfirm, teamName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; teamName: string }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#111118] border border-red-500/20 rounded-2xl p-6 md:p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                    <Trash2 className="w-6 h-6 text-red-500" />
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Delete Team?</h2>
                <p className="text-sm text-gray-400 mb-6">
                    Are you sure you want to remove <span className="text-white font-semibold">{teamName}</span> and all its members? This action cannot be undone.
                </p>

                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 border border-white/10 rounded-xl hover:border-white/20 hover:text-gray-200 transition-all">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        Delete Team
                    </button>
                </div>
            </div>
        </div>
    );
}