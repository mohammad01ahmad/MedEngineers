import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function debugDescription() {
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

    // Find items with descriptions
    res.data.items?.forEach((item, index) => {
        if (item.description) {
            console.log(`\nItem ${index} (${item.title}):`);
            console.log("RAW DESCRIPTION:", JSON.stringify(item.description));
        }
        if (item.questionGroupItem?.grid?.columns?.type) {
            // Check grid descriptions if any
        }
    });

    if (res.data.info?.description) {
        console.log("\nForm Description:");
        console.log("RAW:", JSON.stringify(res.data.info.description));
    }
}

debugDescription().catch(console.error);
