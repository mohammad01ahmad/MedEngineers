import "server-only";

import admin from "firebase-admin";
import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export type DecodedTopTeamsToken = {
    uid: string;
    email?: string;
    admin?: boolean;
    mentor?: boolean;
};

export const TOP_TEAMS_COLLECTION = "top_15_selected_teams";
export const TOP_TEAMS_LIMIT = 15;

export async function verifyTopTeamsBearer(
    request: NextRequest,
    options: { requireMentor?: boolean; allowAdmin?: boolean; allowMentor?: boolean }
): Promise<DecodedTopTeamsToken> {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("UNAUTHORIZED");
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken, true);

    if (options.requireMentor === true && decodedToken.mentor !== true) {
        throw new Error("FORBIDDEN");
    }

    const allowsAdmin = options.allowAdmin === true && decodedToken.admin === true;
    const allowsMentor = options.allowMentor === true && decodedToken.mentor === true;
    if (options.requireMentor !== true && !allowsAdmin && !allowsMentor) {
        throw new Error("FORBIDDEN");
    }

    return decodedToken;
}

export function selectedAtValue(value: unknown) {
    if (value instanceof admin.firestore.Timestamp) {
        return value.toDate().toISOString();
    }

    return value ?? null;
}
