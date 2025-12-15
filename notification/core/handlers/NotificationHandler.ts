import {Request} from 'express';
import {injectable} from 'inversify';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Get service account from environment variable or file
let serviceAccount: any;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Load from environment variable (JSON string)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    // Load from file - try multiple possible paths
    const possiblePaths = [
        path.resolve(__dirname, '../../kawenda.json'),
        path.resolve(__dirname, '../../../notification/kawenda.json'),
        path.resolve(process.cwd(), 'notification/kawenda.json'),
        path.resolve(process.cwd(), 'kawenda.json'),
    ];

    let serviceAccountPath: string | null = null;
    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            serviceAccountPath = possiblePath;
            break;
        }
    }

    if (!serviceAccountPath) {
        throw new Error('Firebase service account file not found. Please ensure kawenda.json exists or set FIREBASE_SERVICE_ACCOUNT environment variable.');
    }

    // Read and parse the service account file
    const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountFile);
}

// Ensure private_key has proper newlines if it's a string
if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

// Initialize Firebase Admin SDK if it hasn't been initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

@injectable()
export class NotificationHandler {
    async handleNotification(req: Request): Promise<{ success: boolean; message: string }> {
        try {
            const {message, topic, title, data} = req.body;

            if (!message || !topic || !title) {
                return {success: false, message: "Please add message, topic, and title"};
            }

            // Define the notification payload
            const payload = {
                notification: {
                    title: title,
                    body: message,
                },
                data,
                topic: topic,
            };

            // Send the notification
            const response = await admin.messaging().send(payload as any);
            console.log("Response on notification send:", response);
            return {success: true, message: "Notification sent successfully"};

        } catch (err) {
            console.error("Error sending notification:", err);
            return {success: false, message: `Error sending notification ${err}`};
        }
    }
}
