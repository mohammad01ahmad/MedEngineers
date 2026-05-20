import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifyAdminBearer } from "@/app/api/teams/_lib";

export async function POST(request: NextRequest) {
    try {
        await verifyAdminBearer(request);

        const body = await request.json();
        const teamId = String(body.teamId || "").trim();

        if (!teamId) {
            return NextResponse.json({ error: "teamId is required" }, { status: 400 });
        }

        const teamRef = adminDb.collection("teams").doc(teamId);
        const teamDoc = await teamRef.get();
        if (!teamDoc.exists) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        await teamRef.delete();

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        console.error("[TeamsDelete] Failed to delete team:", error);
        return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
    }
}
