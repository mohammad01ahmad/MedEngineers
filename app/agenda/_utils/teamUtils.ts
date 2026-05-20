import { TEAM_COLORS } from "@/app/agenda/_utils/agenda_data";
import { Team, TeamMember } from "@/app/agenda/_utils/agenda_types";

export type StoredTeamMember = {
    uid: string;
    email: string;
    name?: string;
    mobile?: string;
};

export type StoredTeam = {
    team_name: string;
    team_members: StoredTeamMember[];
    submitted?: boolean;
    submission_link?: string;
    product_title?: string;
    product_description?: string;
    selectedAt?: string | null;
    selectedByUid?: string;
    selectedByEmail?: string;
    selected_for_top_15?: boolean;
};

export function getTeamColorClass(teamName: string) {
    let hash = 0;
    for (let i = 0; i < teamName.length; i += 1) {
        hash = (hash * 31 + teamName.charCodeAt(i)) >>> 0;
    }

    return TEAM_COLORS[hash % TEAM_COLORS.length];
}

export function mapStoredTeamToAgendaTeam(teamId: string, storedTeam: StoredTeam): Team {
    const members: TeamMember[] = (storedTeam.team_members || []).map((member) => ({
        uid: member.uid,
        email: member.email,
        name: member.name || "",
        mobile: member.mobile || "N/A",
    }));

    return {
        id: teamId,
        name: storedTeam.team_name,
        members,
        colorClass: getTeamColorClass(storedTeam.team_name),
        submitted: storedTeam.submitted === true,
        submissionLink: storedTeam.submission_link || "",
        productTitle: storedTeam.product_title || "",
        productDescription: storedTeam.product_description || "",
        selectedAt: storedTeam.selectedAt || null,
        selectedByUid: storedTeam.selectedByUid || "",
        selectedByEmail: storedTeam.selectedByEmail || "",
        selectedForTop15: storedTeam.selected_for_top_15 === true,
    };
}
