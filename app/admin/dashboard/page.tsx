import { adminDb } from "@/lib/firebaseAdmin";
import { columns, Competitor } from "./columns"; // Import the type
import { DataTable } from "./data-table";
import LogoutButton from "@/components/logout"

// Add these exports to disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getMedicineCompetitors(): Promise<Competitor[]> {
    const competitorsRef = adminDb.collection("competitors");
    const snapshot = await competitorsRef.where("major", "in", ["Medicine", "Healthcare"]).get();

    // Cast the data to Competitor
    return snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(data.status);
        return {
            id: doc.id,
            fullName: data.fullName || "",
            email: data.email || "",
            major: data.major || "",
            status: data.status || "pending",
        } as Competitor;
    });
}
async function getEngineeringCompetitors(): Promise<Competitor[]> {
    const competitorsRef = adminDb.collection("competitors");
    const snapshot = await competitorsRef.where("major", "==", "Engineering").get();

    // Cast the data to Competitor
    return snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(data.status);
        return {
            id: doc.id,
            fullName: data.fullName || "",
            email: data.email || "",
            major: data.major || "",
            status: data.status || "pending",
        } as Competitor;
    });
}

export default async function DashboardPage() {
    const data = await getMedicineCompetitors();
    const engineeringData = await getEngineeringCompetitors();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-5">Healthcare Competitors</h1>
            <p className="text-muted-foreground mb-5">Guide: Click on the competitor's name which will open their details on another tab to view and update their status. All changes will be displayed in the table below.</p>
            {/* Now 'data' matches 'columns' types exactly */}
            <DataTable columns={columns} data={data} />
            <div className="mt-5 border p-5 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Healthcare Stats</h2>
                <p>Total Healthcare Competitors: {data.length}</p>
                <p>Accepted Applications: {data.filter((competitor) => competitor.status.toLowerCase() === "accepted").length}</p>
                <p>Rejected Applications: {data.filter((competitor) => competitor.status.toLowerCase() === "rejected").length}</p>
            </div>

            <h1 className="text-2xl font-bold mb-5 mt-20">Engineering Competitors</h1>
            <DataTable columns={columns} data={engineeringData} />
            <div className="mt-5 border p-5 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Engineering Stats</h2>
                <p>Total Engineering Competitors: {engineeringData.length}</p>
                <p>Accepted Applications: {engineeringData.filter((competitor) => competitor.status.toLowerCase() === "accepted").length}</p>
                <p>Rejected Applications: {engineeringData.filter((competitor) => competitor.status.toLowerCase() === "rejected").length}</p>
            </div>

            <div className="mt-10">
                <LogoutButton />
            </div>
        </div>
    );
}