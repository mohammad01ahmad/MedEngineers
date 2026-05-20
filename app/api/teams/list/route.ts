import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifyAdminBearer } from "@/app/api/teams/_lib";
import { StoredTeam } from "@/app/agenda/_utils/teamUtils";

export async function GET(request: NextRequest) {
    try {
        await verifyAdminBearer(request, { allowMentor: true });

        const snapshot = await adminDb.collection("teams").get();
        const teams: Array<StoredTeam & { id: string }> = snapshot.docs
            .map((doc) => ({
                id: doc.id,
                ...(doc.data() as StoredTeam),
            }))
            .sort((a, b) => String(a.team_name || "").localeCompare(String(b.team_name || "")));

        return NextResponse.json({ teams }, { status: 200 });
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        console.error("[TeamsList] Failed to list teams:", error);
        return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
    }
}
