import {Request} from 'express';
import {injectable} from 'inversify';
import * as admin from 'firebase-admin';
import * as path from 'path';

// Replace with the path to your service account JSON file
const serviceAccountPath = path.resolve(__dirname, '../../kawenda.json');

// Initialize Firebase Admin SDK if it hasn't been initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require(serviceAccountPath)),
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
            return {success: false, message: `Error sending notification`};
        }
    }
}
