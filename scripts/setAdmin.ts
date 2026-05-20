import { adminAuth } from '../lib/firebaseAdminForScripts';

type SupportedClaim = "admin" | "mentor";

async function setRoleClaim(email: string, claim: SupportedClaim) {
    try {
        const user = await adminAuth.getUserByEmail(email);
        await adminAuth.setCustomUserClaims(user.uid, {
            ...(user.customClaims || {}),
            [claim]: true,
        });

        console.log(`✅ ${claim.charAt(0).toUpperCase() + claim.slice(1)} claim set for ${email}`);
        console.log(`⚠️  User must sign out and sign in again`);
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

const email = process.argv[2];
const roleArg = process.argv[3] || "--admin";
const claim = roleArg === "--mentor" || roleArg === "mentor" ? "mentor" : "admin";

if (!email) {
    console.error('❌ Provide an email!');
    console.log('Usage: npm run set-admin <email> [--admin|--mentor]');
    console.log('Examples:');
    console.log('  npm run set-admin -- user@example.com --admin');
    console.log('  npm run set-admin -- user@example.com --mentor');
    process.exit(1);
}

if (!["--admin", "admin", "--mentor", "mentor"].includes(roleArg)) {
    console.error('❌ Unsupported role flag!');
    console.log('Usage: npm run set-admin <email> [--admin|--mentor]');
    process.exit(1);
}

setRoleClaim(email, claim);

// npm run set-admin -- <email> --admin
// npm run set-admin -- <email> --mentor
