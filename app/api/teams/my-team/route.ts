import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { StoredTeam } from "@/app/agenda/_utils/teamUtils";

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken, true);
        const userEmail = decodedToken.email?.toLowerCase().trim();

        if (!decodedToken.uid || !userEmail) {
            return NextResponse.json({ error: "Unable to resolve current user" }, { status: 400 });
        }

        const snapshot = await adminDb.collection("teams").get();
        const matchingDoc = snapshot.docs.find((doc) => {
            const team = doc.data() as StoredTeam;
            return (team.team_members || []).some((member) =>
                member.uid === decodedToken.uid ||
                member.email?.toLowerCase().trim() === userEmail
            );
        });

        if (!matchingDoc) {
            return NextResponse.json({ team: null }, { status: 200 });
        }

        return NextResponse.json({
            team: {
                id: matchingDoc.id,
                ...(matchingDoc.data() as StoredTeam),
            },
        }, { status: 200 });
    } catch (error) {
        console.error("[MyTeam] Failed to load team:", error);
        return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
    }
}
