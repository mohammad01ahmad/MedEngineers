import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { selectedAtValue, TOP_TEAMS_COLLECTION, TOP_TEAMS_LIMIT, verifyTopTeamsBearer } from "@/app/api/top-teams/_lib";

export async function POST(request: NextRequest) {
    try {
        const decodedToken = await verifyTopTeamsBearer(request, { requireMentor: true });
        const body = await request.json();
        const teamId = String(body.teamId || body.teamName || "").trim();

        if (!teamId) {
            return NextResponse.json({ error: "teamId is required" }, { status: 400 });
        }

        const sourceRef = adminDb.collection("teams").doc(teamId);
        const selectedRef = adminDb.collection(TOP_TEAMS_COLLECTION).doc(teamId);

        await adminDb.runTransaction(async (transaction) => {
            const [sourceDoc, selectedDoc, selectedSnapshot] = await Promise.all([
                transaction.get(sourceRef),
                transaction.get(selectedRef),
                transaction.get(adminDb.collection(TOP_TEAMS_COLLECTION)),
            ]);

            if (!sourceDoc.exists) {
                throw new Error("TEAM_NOT_FOUND");
            }

            if (selectedDoc.exists) {
                throw new Error("ALREADY_SELECTED");
            }

            if (selectedSnapshot.size >= TOP_TEAMS_LIMIT) {
                throw new Error("SELECTION_LIMIT_REACHED");
            }

            const sourceData = sourceDoc.data() || {};
            const payload = {
                ...sourceData,
                team_name: sourceData.team_name || sourceDoc.id,
                selectedAt: admin.firestore.FieldValue.serverTimestamp(),
                selectedByUid: decodedToken.uid,
                selectedByEmail: decodedToken.email || "",
                selected_for_top_15: true,
            };

            transaction.set(selectedRef, payload);
            transaction.update(sourceRef, { selected_for_top_15: true });
        });

        const savedDoc = await selectedRef.get();
        const savedData = savedDoc.data() as Record<string, any>;
        const selectedTeam = {
            id: savedDoc.id,
            ...savedData,
            selectedAt: selectedAtValue(savedData.selectedAt),
        };

        return NextResponse.json({ success: true, team: selectedTeam }, { status: 201 });
    } catch (error: any) {
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }
        if (error.message === "FORBIDDEN") {
            return NextResponse.json({ error: "Mentor access required" }, { status: 403 });
        }
        if (error.message === "TEAM_NOT_FOUND") {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }
        if (error.message === "ALREADY_SELECTED") {
            return NextResponse.json({ error: "Team is already selected" }, { status: 409 });
        }
        if (error.message === "SELECTION_LIMIT_REACHED") {
            return NextResponse.json({ error: "The Top 15 selection limit has been reached" }, { status: 409 });
        }

        console.error("[TopTeamsAccept] Failed to accept team:", error);
        return NextResponse.json({ error: "Failed to accept team" }, { status: 500 });
    }
}
