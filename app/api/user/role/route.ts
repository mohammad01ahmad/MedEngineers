import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

/*
---------------------------------------------
This route is for checking the role of a user
in /agenda page
---------------------------------------------
*/

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { uid, idToken } = body as { uid?: string; idToken?: string };

        if (!uid) {
            return NextResponse.json({ error: "uid is required" }, { status: 400 });
        }

        if (!idToken) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken, true);
        } catch (error) {
            console.error("[UserRole] Token verification failed:", error);
            return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
        }

        if (decodedToken.uid !== uid) {
            return NextResponse.json({ error: "Forbidden - You can only view your own role" }, { status: 403 });
        }

        const attendeeDoc = await adminDb.collection("attendees").doc(uid).get();
        if (attendeeDoc.exists && attendeeDoc.data()?.submitted === true) {
            return NextResponse.json({ authorized: true, role: "attendee" }, { status: 200 });
        }

        const competitorDoc = await adminDb.collection("competitors").doc(uid).get();
        if (competitorDoc.exists && competitorDoc.data()?.submitted === true) {
            return NextResponse.json({ authorized: true, role: "competitor" }, { status: 200 });
        }

        return NextResponse.json({ authorized: false, role: null }, { status: 200 });
    } catch (error) {
        console.error("[UserRole] Failed to resolve role:", error);
        return NextResponse.json({ error: "Failed to resolve role" }, { status: 500 });
    }
}
