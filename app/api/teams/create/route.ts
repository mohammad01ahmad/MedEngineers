import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { buildTeamPayload, resolveTeamMembers, serverTimestamp, verifyAdminBearer } from "@/app/api/teams/_lib";

export async function POST(request: NextRequest) {
    try {
        await verifyAdminBearer(request);

        const body = await request.json();
        const teamName = String(body.teamName || "").trim();
        const memberEmails: string[] = Array.isArray(body.memberEmails)
            ? body.memberEmails.map((email: unknown) => String(email))
            : [];

        if (!teamName) {
            return NextResponse.json({ error: "teamName is required" }, { status: 400 });
        }
        if (memberEmails.length === 0 || memberEmails.length > 4) {
            return NextResponse.json({ error: "Each team must have between 1 and 4 members" }, { status: 400 });
        }

        const uniqueEmails = new Set(memberEmails.map((email) => email.trim().toLowerCase()).filter(Boolean));
        if (uniqueEmails.size !== memberEmails.length) {
            return NextResponse.json({ error: "Duplicate member emails are not allowed" }, { status: 400 });
        }

        const teamRef = adminDb.collection("teams").doc(teamName);
        const existingTeam = await teamRef.get();
        if (existingTeam.exists) {
            return NextResponse.json({ error: "A team with this name already exists" }, { status: 409 });
        }

        const { unmatchedEmails, teamMembers } = await resolveTeamMembers(Array.from(uniqueEmails));
        if (unmatchedEmails.length > 0) {
            return NextResponse.json({ error: "Some competitor emails were not found", unmatchedEmails }, { status: 400 });
        }

        await teamRef.set({
            ...buildTeamPayload(teamName, teamMembers),
            createdAt: serverTimestamp(),
        });

        const savedTeam = await teamRef.get();
        return NextResponse.json({ success: true, team: { id: savedTeam.id, ...savedTeam.data() } }, { status: 201 });
    } catch (error: any) {
        if (error.message === "INVALID_TEAM_SIZE") {
            return NextResponse.json({ error: "Each team must have between 1 and 4 members" }, { status: 400 });
        }
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        console.error("[TeamsCreate] Failed to create team:", error);
        return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
    }
}
