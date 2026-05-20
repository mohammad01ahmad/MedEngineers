"use client";

import { CheckCircle2, ExternalLink, Loader2, Search, Users, X } from "lucide-react";
import { Team } from "@/app/agenda/_utils/agenda_types";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { mapStoredTeamToAgendaTeam, StoredTeam } from "@/app/agenda/_utils/teamUtils";

/* ═══════════════════════════════════════════
   MENTOR DASHBOARD COMPONENT
═══════════════════════════════════════════ */
export default function MentorDashboard() {
    const { user } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
    const [activeTeam, setActiveTeam] = useState<Team | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingTeams, setLoadingTeams] = useState(true);
    const [teamsError, setTeamsError] = useState<string | null>(null);
    const [acceptingTeamId, setAcceptingTeamId] = useState<string | null>(null);

    // Load teams from 'teams' collection in firestore
    useEffect(() => {
        const loadTeams = async () => {
            if (!user) return;

            try {
                setLoadingTeams(true);
                setTeamsError(null);
                const idToken = await user.getIdToken();
                const [teamsResponse, selectedResponse] = await Promise.all([
                    fetch("/api/teams/list", {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }),
                    fetch("/api/top-teams/list", {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }),
                ]);

                const teamsData = await teamsResponse.json();
                if (!teamsResponse.ok) {
                    throw new Error(teamsData.error || "Failed to load teams");
                }

                const selectedData = await selectedResponse.json();
                if (!selectedResponse.ok) {
                    throw new Error(selectedData.error || "Failed to load selected teams");
                }

                const mappedTeams = (teamsData.teams || []).map((team: StoredTeam & { id: string }) =>
                    mapStoredTeamToAgendaTeam(team.id, team)
                );
                setTeams(mappedTeams);
                setSelectedTeamIds((selectedData.teams || []).map((team: StoredTeam & { id: string }) => team.id));
            } catch (error: any) {
                console.error("[MentorDashboard] Failed to load teams:", error);
                setTeamsError(error.message || "Failed to load teams");
            } finally {
                setLoadingTeams(false);
            }
        };

        loadTeams();
    }, [user]);

    // Disable scrolling when a team is selected (overlay effect of selected team modal)
    useEffect(() => {
        if (activeTeam) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [activeTeam]);

    // function: to accept a team to the top 15 list
    const acceptTeam = async (team: Team) => {
        if (!user || selectedTeamIds.includes(team.id)) return;

        if (selectedTeamIds.length >= 15) {
            setTeamsError("The Top 15 selection limit has been reached.");
            return;
        }

        try {
            setAcceptingTeamId(team.id);
            setTeamsError(null);
            const idToken = await user.getIdToken();
            const response = await fetch("/api/top-teams/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ teamId: team.id }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to accept team");
            }

            setSelectedTeamIds((prev) => prev.includes(team.id) ? prev : [...prev, team.id]);
        } catch (error: any) {
            console.error("[MentorDashboard] Failed to accept team:", error);
            setTeamsError(error.message || "Failed to accept team");
        } finally {
            setAcceptingTeamId(null);
        }
    };

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const activeTeamSelected = activeTeam ? selectedTeamIds.includes(activeTeam.id) : false;
    const selectionLimitReached = selectedTeamIds.length >= 15;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111118] border border-white/5 p-6 rounded-3xl">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Mentor Evaluation Dashboard</h2>
                    <p className="text-gray-400">Select the Top 15 teams to advance to the next round.</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 px-6 py-3 rounded-2xl flex flex-col items-center min-w-[120px]">
                    <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Selected</span>
                    <span className="text-3xl font-black text-white">{selectedTeamIds.length} <span className="text-lg text-gray-500">/ 15</span></span>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search teams by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111118] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
            </div>

            {teamsError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {teamsError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loadingTeams ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading teams...</div>
                ) : filteredTeams.map(team => {
                    const isSelected = selectedTeamIds.includes(team.id);
                    return (
                        <div
                            key={team.id}
                            onClick={() => setActiveTeam(team)}
                            className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${isSelected ? "bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]" : "bg-white/[0.02] border-white/5 hover:border-white/20"}`}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-white mb-4 pr-8 truncate">{team.name}</h3>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-400">{team.members.length} Members</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            {!loadingTeams && filteredTeams.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No teams found matching "{searchQuery}"
                </div>
            )}

            {activeTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b10] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-[#0b0b10]/95 px-6 py-5 backdrop-blur">
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[2px] text-purple-300">Team Detail</p>
                                <h3 className="truncate text-2xl font-extrabold text-white">{activeTeam.name}</h3>
                            </div>
                            {/* display error here as well */}
                            {teamsError && (
                                <div className="rounded-2xl border border-red-500/30 bg-red-500/15 p-4 animate-pulse">
                                    <p className="text-sm text-red-300">{teamsError}</p>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setActiveTeam(null)}
                                className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                                aria-label="Close team detail"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-6 p-6">
                            <section>
                                <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[1.5px] text-gray-500">
                                    <Users className="h-4 w-4" />
                                    Members
                                </div>
                                <div className="grid gap-3 md:grid-cols-3">
                                    {activeTeam.members.map((member) => (
                                        <div key={member.uid || member.email} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                            <div className="text-sm font-semibold text-white">{member.name || member.email}</div>
                                            <div className="mt-1 break-all text-xs font-mono text-gray-500">{member.email}</div>
                                            <div className="mt-2 text-xs text-gray-500">{member.mobile || "N/A"}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">Product Title</div>
                                <h4 className="text-xl font-bold text-white">{activeTeam.productTitle || "No title submitted"}</h4>
                            </section>

                            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">Product Description</div>
                                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300">
                                    {activeTeam.productDescription || "No description submitted."}
                                </p>
                            </section>

                            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">Submission Link</div>
                                {activeTeam.submissionLink ? (
                                    <a
                                        href={activeTeam.submissionLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex max-w-full items-center gap-2 break-all text-sm font-semibold text-purple-300 transition-colors hover:text-purple-200"
                                    >
                                        <ExternalLink className="h-4 w-4 shrink-0" />
                                        {activeTeam.submissionLink}
                                    </a>
                                ) : (
                                    <p className="text-sm text-gray-500">No link submitted.</p>
                                )}
                            </section>
                        </div>

                        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-white/10 bg-[#0b0b10]/95 px-6 py-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">
                                {activeTeamSelected ? "This team has already been accepted into the Top 15." : `${selectedTeamIds.length} of 15 teams selected.`}
                            </p>
                            <button
                                type="button"
                                disabled={activeTeamSelected || selectionLimitReached || acceptingTeamId === activeTeam.id}
                                onClick={() => acceptTeam(activeTeam)}
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${activeTeamSelected
                                    ? "cursor-not-allowed border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                                    : selectionLimitReached
                                        ? "cursor-not-allowed border border-white/10 bg-white/5 text-gray-500"
                                        : "bg-green-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.25)] hover:bg-emerald-400"
                                    }`}
                            >
                                {acceptingTeamId === activeTeam.id ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Accepting
                                    </>
                                ) : activeTeamSelected ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Selected
                                    </>
                                ) : (
                                    "Accept"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
