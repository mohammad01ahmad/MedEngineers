import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const productTitle = String(body.productTitle || "").trim();
        const submissionLink = String(body.submissionLink || "").trim();
        const productDescription = String(body.productDescription || "").trim();

        if (!productTitle || !submissionLink || !productDescription) {
            return NextResponse.json({ error: "productTitle, submissionLink, and productDescription are required" }, { status: 400 });
        }

        const snapshot = await adminDb.collection("teams").get();
        const matchingDoc = snapshot.docs.find((doc) => {
            const team = doc.data();
            return (team.team_members || []).some((member: any) =>
                member.uid === decodedToken.uid ||
                member.email?.toLowerCase().trim() === userEmail
            );
        });

        if (!matchingDoc) {
            return NextResponse.json({ error: "You are not assigned to any team" }, { status: 404 });
        }

        if (matchingDoc.data().submitted === true) {
            return NextResponse.json({ error: "This team has already submitted a product" }, { status: 409 });
        }

        await matchingDoc.ref.update({
            product_title: productTitle,
            product_description: productDescription,
            submission_link: submissionLink,
            submitted: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await matchingDoc.ref.get();
        return NextResponse.json({
            success: true,
            team: {
                id: updatedDoc.id,
                ...updatedDoc.data(),
            },
        }, { status: 200 });
    } catch (error) {
        console.error("[SubmitProduct] Failed to submit product:", error);
        return NextResponse.json({ error: "Failed to submit product" }, { status: 500 });
    }
}
