import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { selectedAtValue, TOP_TEAMS_COLLECTION, verifyTopTeamsBearer } from "@/app/api/top-teams/_lib";

export async function GET(request: NextRequest) {
    try {
        await verifyTopTeamsBearer(request, { allowAdmin: true, allowMentor: true });

        const snapshot = await adminDb.collection(TOP_TEAMS_COLLECTION).get();
        const teams = snapshot.docs
            .map((doc) => {
                const data = doc.data() as Record<string, any>;
                return {
                    id: doc.id,
                    ...data,
                    selectedAt: selectedAtValue(data.selectedAt),
                } as Record<string, any>;
            })
            .sort((a, b) => String(a.team_name || "").localeCompare(String(b.team_name || "")));

        return NextResponse.json({ teams }, { status: 200 });
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Admin or mentor access required" }, { status: 403 });
        }

        console.error("[TopTeamsList] Failed to list selected teams:", error);
        return NextResponse.json({ error: "Failed to load selected teams" }, { status: 500 });
    }
}
