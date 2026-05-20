"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Trophy, Users } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getInitials } from "@/app/agenda/_hooks/getInitials";
import { Team } from "@/app/agenda/_utils/agenda_types";
import { mapStoredTeamToAgendaTeam, StoredTeam } from "@/app/agenda/_utils/teamUtils";

export default function SelectedTeamsSection() {
    const { user } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSelectedTeams = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);
                const idToken = await user.getIdToken();
                const response = await fetch("/api/top-teams/list", {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to load selected teams");
                }

                setTeams((data.teams || []).map((team: StoredTeam & { id: string }) =>
                    mapStoredTeamToAgendaTeam(team.id, team)
                ));
            } catch (error: any) {
                console.error("[SelectedTeamsSection] Failed to load selected teams:", error);
                setError(error.message || "Failed to load selected teams");
            } finally {
                setLoading(false);
            }
        };

        loadSelectedTeams();
    }, [user]);

    return (
        <section className="mt-12 mb-16">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="mb-2 ml-1 text-[11px] font-bold uppercase tracking-[2px] text-gray-400">
                        Mentor Selections
                    </div>
                    <h3 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-white">
                        <Trophy className="h-7 w-7 text-emerald-400" />
                        Selected <span className="text-emerald-400 italic font-medium font-[family-name:var(--font-playfair)]">Teams</span>
                    </h3>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    These teams are selected by mentors only and cannot be edited here.
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-12 text-center text-sm text-gray-500">
                    Loading selected teams...
                </div>
            ) : teams.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-12 text-center text-sm text-gray-500">
                    No teams have been selected yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                        <article key={team.id} className="rounded-2xl border border-emerald-500/20 bg-white/[0.03] p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h4 className="truncate text-lg font-bold text-white">{team.name}</h4>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                        <Users className="h-3.5 w-3.5" />
                                        {team.members.length} members
                                    </div>
                                </div>
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                            </div>

                            <div className="mb-4 space-y-2">
                                {team.members.map((member) => (
                                    <div key={member.uid || member.email} className="flex items-center gap-2 text-xs text-gray-400">
                                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${team.colorClass}`}>
                                            {getInitials(member.name || member.email)}
                                        </div>
                                        <span className="min-w-0 flex-1 truncate">{member.name || member.email}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-gray-500">Product</div>
                                <p className="line-clamp-1 text-sm font-semibold text-white">{team.productTitle || "No title submitted"}</p>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{team.productDescription || "No description submitted."}</p>
                                {team.submissionLink && (
                                    <a
                                        href={team.submissionLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-3 inline-flex max-w-full items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">Submission</span>
                                    </a>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
