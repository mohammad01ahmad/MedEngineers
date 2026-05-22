import "server-only";

import admin from "firebase-admin";
import { NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

type DecodedAdminToken = {
    uid: string;
    email?: string;
    admin?: boolean;
    mentor?: boolean;
};

export async function verifyAdminBearer(request: NextRequest, options?: { allowMentor?: boolean }): Promise<DecodedAdminToken> {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("UNAUTHORIZED");
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);

    const isAllowed = decodedToken.admin === true || (options?.allowMentor === true && decodedToken.mentor === true);
    if (!isAllowed) {
        throw new Error("FORBIDDEN");
    }

    return decodedToken;
}

export async function resolveTeamMembers(memberEmails: string[]) {
    const normalizedEmails = memberEmails.map((email) => email.trim().toLowerCase()).filter(Boolean);
    if (normalizedEmails.length === 0 || normalizedEmails.length > 4) {
        throw new Error("INVALID_TEAM_SIZE");
    }

    const unmatchedEmails: string[] = [];
    const teamMembers: { uid: string; email: string; name: string; mobile: string }[] = [];

    for (const email of normalizedEmails) {
        const competitorSnapshot = await adminDb
            .collection("competitors")
            .where("email", "==", email)
            .limit(1)
            .get();

        if (competitorSnapshot.empty) {
            unmatchedEmails.push(email);
            continue;
        }

        const competitorDoc = competitorSnapshot.docs[0];
        const competitorData = competitorDoc.data();
        teamMembers.push({
            uid: competitorDoc.id,
            email: competitorData.email || email,
            name: competitorData.fullName || competitorData.name || competitorData.email || email,
            mobile: competitorData.contactNo?.trim() || "N/A",
        });
    }

    return { normalizedEmails, unmatchedEmails, teamMembers };
}

export function buildTeamPayload(teamName: string, teamMembers: { uid: string; email: string; name: string; mobile: string }[]) {
    return {
        team_name: teamName,
        team_members: teamMembers,
        submitted: false,
        submission_link: "",
        selected_for_top_15: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
}

export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
