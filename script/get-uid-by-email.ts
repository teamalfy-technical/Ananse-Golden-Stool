import admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || "ananse-golden-stool",
        });
    }
}

async function getUidByEmail() {
    const email = process.argv[2];
    if (!email) {
        console.error("Usage: npx tsx script/get-uid-by-email.ts <email>");
        process.exit(1);
    }

    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log(`Found UID for ${email}: ${userRecord.uid}`);
    } catch (error) {
        console.error("Error fetching user by email:", error);
    }
}

getUidByEmail();
