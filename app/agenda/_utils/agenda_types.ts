import { LucideIcon } from "lucide-react";
import { Eye, Swords, Shield, Star } from "lucide-react";

// -------------------------------
// Agenda Page - All Types
// -------------------------------

export type TimelineStatus = "done" | "now" | "upcoming";

export interface TimelineNode {
    time: string;
    label: string;
    status: TimelineStatus;
}

export interface AgendaItem {
    id: number;
    time: string;
    endTime: string;
    duration: string;
    title: string;
    description: string;
    location: string;
    icon: LucideIcon;
    color: string;
    shadow: string;
    category: string;
    status: string;
}

export interface SpeakerType {
    id: number;
    name: string;
    initials: string;
    role: string;
    talkTitle: string;
    time: string;
    duration: string;
    tags: string[];
    avatarColor: string;
    upvotes: number;
}

export interface TeamMember {
    uid?: string;
    email: string;
    name?: string;
    mobile?: string;
}

export interface Team {
    id: string;
    name: string;
    members: TeamMember[];
    colorClass: string;
    submitted?: boolean;
    submissionLink?: string;
    productTitle?: string;
    productDescription?: string;
    selectedAt?: string | null;
    selectedByUid?: string;
    selectedByEmail?: string;
    selectedForTop15?: boolean;
}

export type ProjectType = {
    id: number;
    team: string;
    title: string;
    description: string;
    imageUrl: string;
    baseVotes: number;
    members: { initials: string; name: string; phone: string }[];
};

/* ═══════════════════════════════════════════
   DEV MODE ROLE TYPES
═══════════════════════════════════════════ */
export type UserRole = "attendee" | "competitor" | "admin" | "mentor";

export const ROLE_CONFIG: Record<UserRole, { label: string; icon: LucideIcon; color: string; bgColor: string; borderColor: string; description: string }> = {
    attendee: { label: "Attendee", icon: Eye, color: "text-blue-400", bgColor: "bg-blue-500/15", borderColor: "border-blue-500/30", description: "Public view — schedule only" },
    competitor: { label: "Competitor", icon: Swords, color: "text-amber-400", bgColor: "bg-amber-500/15", borderColor: "border-amber-500/30", description: "Participant view — schedule + team info" },
    admin: { label: "Admin", icon: Shield, color: "text-[#007b8a]", bgColor: "bg-[#007b8a]/15", borderColor: "border-[#007b8a]/30", description: "Full access — manage teams & members" },
    mentor: { label: "Mentor", icon: Star, color: "text-purple-400", bgColor: "bg-purple-500/15", borderColor: "border-purple-500/30", description: "Evaluate and select top teams" },
};
