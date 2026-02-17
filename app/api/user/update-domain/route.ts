import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const { idToken, domain } = body;

        if (!idToken || !domain) {
            return NextResponse.json({ error: "idToken and domain are required" }, { status: 400 });
        }

        // 1. Verify User
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (error) {
            console.error("[UpdateDomain] Token verification failed:", error);
            return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
        }

        const uid = decodedToken.uid;

        // 2. Find and Update User in Firestore
        // Check competitors first as it's the primary collection for this flow
        const competitorRef = adminDb.collection("competitors").doc(uid);
        const competitorDoc = await competitorRef.get();

        if (competitorDoc.exists) {
            await competitorRef.update({
                domain: domain,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            return NextResponse.json({ success: true, message: "Domain updated in competitors" }, { status: 200 });
        }

        return NextResponse.json({ error: "User not found in competitors" }, { status: 404 });

    } catch (error: any) {
        console.error("[UpdateDomain] Internal Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
