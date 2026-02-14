
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const { uid } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: "Missing UID" }, { status: 400 });
        }

        console.log("Checking status for UID:", uid);

        // Check attendees collection first
        const attendeeDoc = await adminDb.collection("attendees").doc(uid).get();

        if (attendeeDoc.exists) {
            const data = attendeeDoc.data();
            console.log("Found in attendees:", data);
            return NextResponse.json({
                status: true,
                type: "attendee",
                actualStatus: data?.status || "pending", // Default to pending if no status field
                data: data
            });
        }

        // Check competitors collection
        const competitorDoc = await adminDb.collection("competitors").doc(uid).get();

        if (competitorDoc.exists) {
            const data = competitorDoc.data();
            console.log("Found in competitors:", data);
            return NextResponse.json({
                status: true,
                type: "competitor",
                actualStatus: data?.status || "pending",
                data: data
            });
        }

        console.log("User not found in any collection");
        return NextResponse.json({
            status: false,
            message: "User not found"
        });

    } catch (error) {
        console.error("Status check error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
