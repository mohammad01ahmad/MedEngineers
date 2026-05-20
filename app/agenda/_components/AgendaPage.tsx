"use client";

import { Suspense } from "react";
import AgendaPageInner from "../../page";

/* ═══════════════════════════════════════════
   WRAPPER — Suspense boundary for useSearchParams
═══════════════════════════════════════════ */
export default function AgendaPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#007b8a] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <AgendaPageInner />
        </Suspense>
    );
}