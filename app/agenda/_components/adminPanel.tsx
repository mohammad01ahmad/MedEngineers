"use client";

import React, { useState, useEffect } from "react";
import { LayoutList, LayoutGrid, UserCircle, Shield, Trash2, Search, Plus, Users } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Team } from "@/app/agenda/_utils/agenda_types";
import { getInitials } from "@/app/agenda/_hooks/getInitials";
import TeamModal from "@/app/agenda/_components/teamModal";
import DeleteTeamModal from "@/app/agenda/_components/deleteTeamModal";
import StatCard from "@/app/agenda/_components/StatCard";
import { mapStoredTeamToAgendaTeam, StoredTeam } from "@/app/agenda/_utils/teamUtils";

/* ═══════════════════════════════════════════
   ADMIN PANEL COMPONENT
   (Now accepts preview toggle props)
═══════════════════════════════════════════ */
export default function AdminPanel({ adminView, onViewChange, productsCount }: {
    adminView: "management" | "attendee" | "competitor";
    onViewChange: (view: "management" | "attendee" | "competitor") => void;
    productsCount: number;
}) {
    const { user } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamViewMode, setTeamViewMode] = useState<"table" | "cards">("table");
    const [showAddTeam, setShowAddTeam] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError, setTeamsError] = useState<string | null>(null);

    // Load the teams from Firebase
    useEffect(() => {
        const loadTeams = async () => {
            if (!user) return;

            try {
                setTeamsLoading(true);
                setTeamsError(null);
                const idToken = await user.getIdToken();
                const response = await fetch("/api/teams/list", {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to load teams");
                }

                const mappedTeams = (data.teams || []).map((team: StoredTeam & { id: string }) =>
                    mapStoredTeamToAgendaTeam(team.id, team)
                );
                setTeams(mappedTeams);
            } catch (error: any) {
                console.error("[AdminPanel] Failed to load teams:", error);
                setTeamsError(error.message || "Failed to load teams");
            } finally {
                setTeamsLoading(false);
            }
        };

        loadTeams();
    }, [user]);

    // Prevent background scroll when modals are open (UI)
    useEffect(() => {
        if (showAddTeam || !!teamToDelete) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "";
        };
    }, [showAddTeam, teamToDelete]);

    // Create a new team
    const createTeam = async (payload: { teamName: string; memberEmails: string[] }) => {
        if (!user) return;

        const idToken = await user.getIdToken();
        const response = await fetch("/api/teams/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.unmatchedEmails?.length
                ? `Missing competitors: ${data.unmatchedEmails.join(", ")}`
                : data.error || "Failed to create team");
        }

        const mappedTeam = mapStoredTeamToAgendaTeam(data.team.id, data.team);
        setTeams((prev) => [...prev, mappedTeam].sort((a, b) => a.name.localeCompare(b.name)));
    };

    // Edit an existing team
    const updateTeam = async (payload: { teamId: string; teamName: string; memberEmails: string[] }) => {
        if (!user) return;

        const idToken = await user.getIdToken();
        const response = await fetch("/api/teams/edit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.unmatchedEmails?.length
                ? `Missing competitors: ${data.unmatchedEmails.join(", ")}`
                : data.error || "Failed to update team");
        }

        const mappedTeam = mapStoredTeamToAgendaTeam(data.team.id, data.team);
        setTeams((prev) =>
            prev
                .filter((team) => team.id !== payload.teamId)
                .concat(mappedTeam)
                .sort((a, b) => a.name.localeCompare(b.name))
        );
    };

    // Delete an existing team
    const deleteTeam = async (id: string) => {
        if (!user) return;

        const idToken = await user.getIdToken();
        const response = await fetch("/api/teams/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ teamId: id }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Failed to delete team");
        }

        setTeams((prev) => prev.filter((team) => team.id !== id));
        setTeamToDelete(null);
    };

    // Filter teams based on search query
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(normalizedSearchQuery) ||
        t.members.some(m => m.email.toLowerCase().includes(normalizedSearchQuery))
    );

    // Flatten and filter for contestant view
    const allMembers = teams.flatMap(t => t.members.map(m => ({ ...m, team: t })))
        .filter(m =>
            !normalizedSearchQuery ||
            m.team.name.toLowerCase().includes(normalizedSearchQuery) ||
            m.email.toLowerCase().includes(normalizedSearchQuery)
        );

    const isPreview = adminView !== "management";

    return (
        <div className="space-y-6">
            {/* Admin Section Header - ALWAYS CLEAR */}
            <div className="mt-4 mb-2 p-6 md:p-8 bg-white/[0.02] border border-white/10 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#007b8a]/5 blur-[80px] -mr-10 -mt-10 pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#007b8a]/20 flex items-center justify-center border border-[#007b8a]/30 shadow-[0_0_20px_rgba(0,123,138,0.1)]">
                            <Shield className="w-6 h-6 text-[#007b8a]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-extrabold text-white tracking-tight">Admin <span className="text-[#007b8a] italic font-medium font-[family-name:var(--font-playfair)]">Dashboard</span></h2>
                            </div>
                            <p className="text-gray-500 text-sm mt-1 font-medium italic">Full administrative oversight for MedEngineers 2026</p>
                        </div>
                    </div>

                    {/* View Selection Toggle */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
                        <button
                            onClick={() => onViewChange("management")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-[1px] uppercase transition-all ${adminView === "management" ? "bg-[#007b8a] text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                        >
                            Management
                        </button>
                        <button
                            onClick={() => onViewChange("competitor")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-[1px] uppercase transition-all ${adminView === "competitor" ? "bg-amber-500/80 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                        >
                            Competitor Preview
                        </button>
                        <button
                            onClick={() => onViewChange("attendee")}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-[1px] uppercase transition-all ${adminView === "attendee" ? "bg-blue-500/80 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                        >
                            Attendee Preview
                        </button>
                    </div>
                </div>
            </div>

            {/* Admin Content - DIMMED IN PREVIEW MODES */}
            <div className={`transition-all duration-700 ${isPreview ? "opacity-30 grayscale blur-[4px] pointer-events-none scale-[0.98]" : "opacity-100"}`}>

                {/* Stats row - Unified and simplified */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
                    <StatCard value={String(teams.length)} label="Total Teams" accentColor="bg-[#007b8a]" icon={Users} />
                    <StatCard value={String(allMembers.length)} label="Total Contestants" accentColor="bg-blue-500" icon={UserCircle} />
                    <StatCard value={String(productsCount)} label="Products Submitted" accentColor="bg-emerald-500" icon={LayoutList} />
                </div>

                {/* Teams & Contestants section label */}
                <div className="text-[10px] font-bold tracking-[2px] uppercase text-gray-500 mb-4">
                    Teams & Contestants
                </div>

                {teamsError && (
                    <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {teamsError}
                    </div>
                )}

                {/* View bar — this bar is the main search functionality to search for teams or contestants*/}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex-1 max-w-md relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search team names or contestants emails...."
                            className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-white/[0.03] text-gray-200 placeholder-gray-500 focus:outline-none focus:bg-white/[0.05] focus:border-[#007b8a] transition-all duration-200 sm:text-sm shadow-inner"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
                            <button
                                onClick={() => setTeamViewMode("table")}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold tracking-[1px] uppercase transition-all ${teamViewMode === "table" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                            >
                                <Users className="w-3.5 h-3.5" />
                                Contestants
                            </button>
                            <button
                                onClick={() => setTeamViewMode("cards")}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold tracking-[1px] uppercase transition-all ${teamViewMode === "cards" ? "bg-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Teams
                            </button>
                        </div>
                        <button
                            onClick={() => setShowAddTeam(true)}
                            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#007b8a] text-white rounded-xl hover:bg-[#008f9f] transition-all shadow-[0_0_15px_rgba(0,123,138,0.3)]"
                        >
                            <Plus className="w-4 h-4" />
                            Add Team
                        </button>
                    </div>
                </div>

                {/* ─── TABLE VIEW ─── */}
                {teamViewMode === "table" && (
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                        {teamsLoading ? (
                            <div className="text-center py-16 text-gray-500">
                                <p className="text-sm">Loading teams...</p>
                            </div>
                        ) : allMembers.length === 0 ? (
                            <div className="text-center py-16 text-gray-500">
                                <div className="text-4xl mb-4">👥</div>
                                <p className="text-sm">No contestants found — create a team to add them</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-white/[0.04]">
                                            <th className="px-4 md:px-5 py-3 text-left text-[10px] font-bold tracking-[1.5px] uppercase text-gray-500">#</th>
                                            <th className="px-4 md:px-5 py-3 text-left text-[10px] font-bold tracking-[1.5px] uppercase text-gray-500">Contestant</th>
                                            <th className="px-4 md:px-5 py-3 text-left text-[10px] font-bold tracking-[1.5px] uppercase text-gray-500">Team</th>
                                            <th className="px-4 md:px-5 py-3 text-left text-[10px] font-bold tracking-[1.5px] uppercase text-gray-500 hidden md:table-cell">Email</th>
                                            <th className="px-4 md:px-5 py-3 text-left text-[10px] font-bold tracking-[1.5px] uppercase text-gray-500 hidden md:table-cell">Mobile</th>
                                            <th className="px-4 md:px-5 py-3 text-left text-[10px] font-bold tracking-[1.5px] uppercase text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allMembers.map((member, i) => (
                                            <tr key={`${member.team.id}-${i}`} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 md:px-5 py-3.5 text-xs text-gray-500 font-mono">{String(i + 1).padStart(2, "0")}</td>
                                                <td className="px-4 md:px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${member.team.colorClass}`}>
                                                            {getInitials(member.name || member.email)}
                                                        </div>
                                                        <span className="text-sm text-white font-medium">{member.name || member.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-5 py-3.5">
                                                    <span className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-md px-2.5 py-1 text-xs font-mono">
                                                        <span className="text-gray-300">{member.team.name}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-5 py-3.5 hidden md:table-cell">
                                                    <span className="text-xs text-gray-400 font-mono">{member.email}</span>
                                                </td>
                                                <td className="px-4 md:px-5 py-3.5 hidden md:table-cell">
                                                    <span className="text-xs text-gray-400 font-mono">{member.mobile || "N/A"}</span>
                                                </td>
                                                <td className="px-4 md:px-5 py-3.5 flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingTeam(member.team);
                                                            setShowAddTeam(true);
                                                        }}
                                                        className="text-xs font-semibold text-blue-400 border border-blue-400/30 bg-transparent px-3 py-1 rounded-md hover:bg-blue-400/10 transition-all"
                                                    >
                                                        Edit Team
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── CARDS VIEW ─── */}
                {teamViewMode === "cards" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamsLoading ? (
                            <div className="text-center py-16 text-gray-500 col-span-full">
                                <p className="text-sm">Loading teams...</p>
                            </div>
                        ) : filteredTeams.length === 0 ? (
                            <div className="text-center py-16 text-gray-500 col-span-full">
                                <div className="text-4xl mb-4">👥</div>
                                <p className="text-sm">No teams found matching your search</p>
                            </div>
                        ) : (
                            filteredTeams.map(team => (
                                <div key={team.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 transition-all duration-300 hover:border-white/[0.15] hover:-translate-y-1">
                                    {/* Card header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div>
                                            <div className="text-base font-semibold text-white">{team.name}</div>
                                            <div className="text-[11px] text-gray-500 font-mono">{team.members.length} member{team.members.length !== 1 ? "s" : ""}</div>
                                        </div>
                                    </div>

                                    {/* Members list */}
                                    <div className="flex flex-col gap-2 mb-4">
                                        {team.members.map((m, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${team.colorClass}`}>
                                                    {getInitials(m.name || m.email)}
                                                </div>
                                                <span className="flex-1 truncate">{m.name || m.email}</span>
                                                <span className="text-[10px] text-gray-600 font-mono truncate">{m.email}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Card footer */}
                                    <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                                        <button
                                            onClick={() => {
                                                setEditingTeam(team);
                                                setShowAddTeam(true);
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 border border-blue-400/30 bg-transparent px-3 py-1.5 rounded-lg hover:bg-blue-400/10 transition-all"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setTeamToDelete(team)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 border border-red-400/30 bg-transparent px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-all"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
            {/* Add/Edit Team Modal - Outside dimmed area */}
            <TeamModal
                isOpen={showAddTeam}
                allTeams={teams}
                onClose={() => {
                    setShowAddTeam(false);
                    setEditingTeam(null);
                }}
                onSave={async (payload) => {
                    try {
                        setTeamsError(null);
                        if (editingTeam && payload.teamId) {
                            await updateTeam({
                                teamId: payload.teamId,
                                teamName: payload.teamName,
                                memberEmails: payload.memberEmails,
                            });
                        } else {
                            await createTeam({
                                teamName: payload.teamName,
                                memberEmails: payload.memberEmails,
                            });
                        }
                    } catch (error: any) {
                        setTeamsError(error.message || "Failed to save team");
                        throw error;
                    }
                }}
                initialTeam={editingTeam}
            />

            <DeleteTeamModal
                isOpen={!!teamToDelete}
                onClose={() => setTeamToDelete(null)}
                onConfirm={() => {
                    deleteTeam(teamToDelete!.id).catch((error) => {
                        console.error("[AdminPanel] Failed to delete team:", error);
                        setTeamsError(error.message || "Failed to delete team");
                    });
                }}
                teamName={teamToDelete?.name || ""}
            />
        </div>
    );
}
