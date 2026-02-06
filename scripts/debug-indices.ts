import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function debugIndices() {
    const formId = process.env.GOOGLE_FORM_ID;
    console.log(`Fetching form: ${formId}`);

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/forms.body.readonly"],
    });

    const forms = google.forms({ version: "v1", auth });
    const res = await forms.forms.get({ formId });

    console.log("\n--- FORM ITEMS ---");
    res.data.items?.forEach((item, index) => {
        const type = item.questionItem ? "Question" : (item.questionGroupItem ? "Group" : "Header/Other");
        console.log(`Index ${index} (1-based ${index + 1}): [${type}] ${item.title}`);
    });
}

debugIndices().catch(console.error);
