import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { buildTeamPayload, resolveTeamMembers, serverTimestamp, verifyAdminBearer } from "@/app/api/teams/_lib";

export async function POST(request: NextRequest) {
    try {
        await verifyAdminBearer(request);

        const body = await request.json();
        const teamId = String(body.teamId || "").trim();
        const teamName = String(body.teamName || "").trim();
        const memberEmails: string[] = Array.isArray(body.memberEmails)
            ? body.memberEmails.map((email: unknown) => String(email))
            : [];

        if (!teamId || !teamName) {
            return NextResponse.json({ error: "teamId and teamName are required" }, { status: 400 });
        }
        if (memberEmails.length !== 3) {
            return NextResponse.json({ error: "Each team must have exactly 3 members" }, { status: 400 });
        }

        const uniqueEmails = new Set(memberEmails.map((email) => email.trim().toLowerCase()).filter(Boolean));
        if (uniqueEmails.size !== memberEmails.length) {
            return NextResponse.json({ error: "Duplicate member emails are not allowed" }, { status: 400 });
        }

        const currentRef = adminDb.collection("teams").doc(teamId);
        const currentDoc = await currentRef.get();
        if (!currentDoc.exists) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const targetRef = adminDb.collection("teams").doc(teamName);
        if (teamName !== teamId) {
            const targetDoc = await targetRef.get();
            if (targetDoc.exists) {
                return NextResponse.json({ error: "A team with the new name already exists" }, { status: 409 });
            }
        }

        const { unmatchedEmails, teamMembers } = await resolveTeamMembers(Array.from(uniqueEmails));
        if (unmatchedEmails.length > 0) {
            return NextResponse.json({ error: "Some competitor emails were not found", unmatchedEmails }, { status: 400 });
        }

        const currentData = currentDoc.data() || {};
        const payload = {
            ...buildTeamPayload(teamName, teamMembers),
            createdAt: currentData.createdAt || serverTimestamp(),
        };

        if (teamName === teamId) {
            await currentRef.set(payload, { merge: true });
        } else {
            const batch = adminDb.batch();
            batch.set(targetRef, payload);
            batch.delete(currentRef);
            await batch.commit();
        }

        const savedTeam = await targetRef.get();
        return NextResponse.json({ success: true, team: { id: savedTeam.id, ...savedTeam.data() } }, { status: 200 });
    } catch (error: any) {
        if (error.message === "INVALID_TEAM_SIZE") {
            return NextResponse.json({ error: "Each team must have exactly 3 members" }, { status: 400 });
        }
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        console.error("[TeamsEdit] Failed to edit team:", error);
        return NextResponse.json({ error: "Failed to edit team" }, { status: 500 });
    }
}
