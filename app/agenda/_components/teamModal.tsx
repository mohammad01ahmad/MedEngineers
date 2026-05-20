"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Team } from "@/app/agenda/_utils/agenda_types";
import { AlertModal } from "@/components/AlertModal";

/* ═══════════════════════════════════════════
   TEAM MODAL (Add & Edit)
═══════════════════════════════════════════ */
export default function TeamModal({ isOpen, onClose, onSave, initialTeam, allTeams
}: { isOpen: boolean; onClose: () => void; onSave: (payload: { teamId?: string; teamName: string; memberEmails: string[] }) => void | Promise<void>; initialTeam?: Team | null; allTeams: Team[]; }) {
    const EMPTY_TEAM_MEMBERS = ["", "", ""];

    // --- TEAM FORM LOGIC ---
    const [teamName, setTeamName] = useState(initialTeam ? initialTeam.name : "");
    const [members, setMembers] = useState<string[]>(
        initialTeam && initialTeam.members.length > 0
            ? initialTeam.members.map((member) => member.email)
            : EMPTY_TEAM_MEMBERS
    );
    const [alertConfig, setAlertConfig] = useState<{ title: string, message: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTeamName(initialTeam ? initialTeam.name : "");
            setMembers(initialTeam && initialTeam.members.length > 0 ? initialTeam.members.map((member) => member.email) : EMPTY_TEAM_MEMBERS);
        }
    }, [isOpen, initialTeam]);

    const updateMember = (index: number, value: string) => {
        setMembers(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    // function to save the NEW TEAM created 
    const handleSave = async () => {
        if (!teamName.trim()) return setAlertConfig({ title: "Team Name Required", message: "Please enter a name for your team before saving." });

        const validMembers = members.map((email) => email.trim()).filter(Boolean);
        if (validMembers.length !== 3) {
            return setAlertConfig({ title: "3 Members Required", message: "Each team must have exactly 3 members." });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const memberEmail of validMembers) {
            if (!emailRegex.test(memberEmail)) {
                return setAlertConfig({ title: "Invalid Email", message: `The email address "${memberEmail}" format is incorrect. Please fix it before saving.` });
            }
        }

        // Duplicate email check (within the team)
        const emailsInThisTeam = validMembers.map((email) => email.toLowerCase());
        const uniqueEmailsInThisTeam = new Set(emailsInThisTeam);
        if (uniqueEmailsInThisTeam.size !== emailsInThisTeam.length) {
            return setAlertConfig({ title: "Duplicate Emails", message: "You have duplicate emails within this team. Each member must have a unique email address." });
        }

        // Duplicate email check (across other teams)
        for (const otherTeam of allTeams) {
            if (initialTeam && otherTeam.id === initialTeam.id) continue;
            for (const otherMember of otherTeam.members) {
                if (emailsInThisTeam.includes(otherMember.email.toLowerCase().trim())) {
                    return setAlertConfig({ title: "Conflict Found", message: `Member with email ${otherMember.email} is already registered in another team: ${otherTeam.name}` });
                }
            }
        }

        try {
            await onSave({
                teamId: initialTeam?.id,
                teamName: teamName.trim(),
                memberEmails: validMembers,
            });
            setTeamName("");
            setMembers(EMPTY_TEAM_MEMBERS);
            onClose();
        } catch (error: any) {
            setAlertConfig({
                title: "Unable to Save Team",
                message: error.message || "Something went wrong while saving this team.",
            });
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
                <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                        <X className="w-4 h-4" />
                    </button>

                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        {initialTeam ? "Edit" : "Add"} <span className="text-[#007b8a] italic font-[family-name:var(--font-playfair)]">Team</span>
                    </h2>

                    {/* Team Name */}
                    <div className="mb-5">
                        <label className="block text-[10px] font-bold tracking-[1px] uppercase text-gray-500 mb-2">Team Name</label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            placeholder="e.g. Team Phoenix"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-xl text-white text-sm px-4 py-3 focus:outline-none focus:border-[#007b8a] transition-colors placeholder:text-gray-600"
                        />
                    </div>

                    {/* Members */}
                    <div className="text-[10px] font-bold tracking-[1px] uppercase text-gray-500 mb-3">Members</div>
                    {members.map((memberEmail, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-3 relative overflow-visible">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-bold tracking-[1px] uppercase text-gray-500">Member {i + 1}</span>
                                <div className="text-[10px] text-gray-600">Required</div>
                            </div>

                            <div className="mb-2 relative">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-[10px] font-bold tracking-[1px] uppercase text-gray-500">Email Address</label>
                                </div>
                                <input
                                    type="email"
                                    value={memberEmail}
                                    onChange={(e) => updateMember(i, e.target.value)}
                                    placeholder="teammate@example.com"
                                    className={`w-full bg-white/[0.04] border rounded-lg text-white text-xs px-3 py-2.5 focus:outline-none transition-colors placeholder:text-gray-600 ${memberEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail.trim())
                                        ? "border-red-500/50 focus:border-red-500"
                                        : "border-white/10 focus:border-[#007b8a]"
                                        }`}
                                />
                            </div>
                        </div>
                    ))}

                    <p className="text-xs text-gray-500 mb-6">Each team must include exactly 3 competitor emails.</p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-5 border-t border-white/10">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 border border-white/10 rounded-xl hover:border-white/20 hover:text-gray-200 transition-all">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-[#007b8a] text-white rounded-xl hover:bg-[#008f9f] transition-all shadow-[0_0_15px_rgba(0,123,138,0.3)]">
                            {initialTeam ? "Update Team" : "Save Team"}
                        </button>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={!!alertConfig}
                onClose={() => setAlertConfig(null)}
                title={alertConfig?.title || ""}
                message={alertConfig?.message || ""}
            />
        </>
    );
}
