import {Request} from 'express';
import {injectable} from 'inversify';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv'; 





dotenv.config()
// Initialize Firebase Admin SDK if it hasn't been initialized
console.log(`Example app listening at http://localhost:${process.env.PORT}`)
if (!admin.apps.length) {
    try {
        // Validate required environment variables
        if (!process.env.PROJECT_ID || !process.env.PRIVATE_KEY || !process.env.CLIENT_EMAIL) {
            throw new Error('Missing required Firebase environment variables. Please set PROJECT_ID, PRIVATE_KEY, and CLIENT_EMAIL');
        }

        // Build service account from environment variables
        const serviceAccount = {
            type: process.env.TYPE || 'service_account',
            project_id: process.env.PROJECT_ID,
            private_key_id: process.env.PRIVATE_KEY_ID,
            private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
            client_email: process.env.CLIENT_EMAIL,
            client_id: process.env.CLIENT_ID,
            auth_uri: process.env.AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
            token_uri: process.env.TOKEN_URI || 'https://oauth2.googleapis.com/token',
            auth_provider_x509_cert_url: process.env.AUTH_PROVIDER || 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.CLIENT_URL,
            universe_domain: process.env.UNIVERSE_DOMAIN || 'googleapis.com'
        };

        // Validate private key format
        if (!serviceAccount.private_key || !serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
            throw new Error('Invalid private key format in PRIVATE_KEY environment variable');
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
        
        console.log('Firebase Admin SDK initialized successfully from environment variables');
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
        throw error;
    }
}

@injectable()
export class NotificationHandler {
    async handleNotification(req: Request): Promise<{ success: boolean; message: string }> {
        try {
            const {message, topic, title, data} = req.body;

            if (!message || !topic || !title) {
                return {success: false, message: "Please add message, topic, and title"};
            }

            // Format topic for sending notifications (convert to string, remove /topics/ prefix if present)
            let formattedTopic = String(topic).trim();
            if (formattedTopic.startsWith('/topics/')) {
                formattedTopic = formattedTopic.substring(8); // Remove '/topics/' prefix
            }

            // Define the notification payload
            const payload: admin.messaging.Message = {
                notification: {
                    title: title,
                    body: message,
                },
                data: data || {},
                topic: formattedTopic,
            };

            // Send the notification to topic
            const response = await admin.messaging().send(payload);
            console.log("Response on notification send:", response);
            return {success: true, message: "Notification sent successfully"};

        } catch (err: any) {
            console.error("Error sending notification:", err);
            
            // Provide more specific error messages
            let errorMessage = 'Error sending notification';
            if (err?.code === 'app/invalid-credential') {
                errorMessage = 'Firebase credentials are invalid. Please check: 1) Server time is synced, 2) Service account key is valid and not revoked in Firebase Console';
            } else if (err?.code === 'messaging/invalid-argument') {
                errorMessage = 'Invalid notification payload. Please check topic, title, and message format';
            } else if (err?.message) {
                errorMessage = err.message;
            }
            
            return {success: false, message: errorMessage};
        }
    }

    async subscribeToTopic(req: Request): Promise<{ success: boolean; message: string }> {
        try {
            const {token, topic} = req.body;

            if (!token || !topic) {
                return {success: false, message: "Please provide token and topic"};
            }

            // Format topic to match Firebase requirements: /topics/[a-zA-Z0-9-_.~%]+
            // Convert topic to string (handles both string and number inputs)
            let formattedTopic = String(topic).trim();
            if (formattedTopic.startsWith('/topics/')) {
                formattedTopic = formattedTopic.substring(8); // Remove '/topics/' prefix
            }
            // Validate topic name format (alphanumeric, dash, underscore, dot, tilde, percent)
            if (!/^[a-zA-Z0-9-_.~%]+$/.test(formattedTopic)) {
                return {success: false, message: "Topic name contains invalid characters. Only alphanumeric characters, dash, underscore, dot, tilde, and percent are allowed."};
            }
            formattedTopic = `/topics/${formattedTopic}`;

            // Subscribe the device to the topic
            const response = await admin.messaging().subscribeToTopic([token], formattedTopic);
            console.log("Response on topic subscription:", response);
            
            if (response.successCount > 0) {
                return {success: true, message: `Successfully subscribed to topic: ${topic}`};
            } else {
                return {success: false, message: `Failed to subscribe to topic: ${topic}. Errors: ${JSON.stringify(response.errors)}`};
            }

        } catch (err: any) {
            console.error("Error subscribing to topic:", err);
            
            let errorMessage = 'Error subscribing to topic';
            if (err?.message) {
                errorMessage = err.message;
            }
            
            return {success: false, message: errorMessage};
        }
    }

    async unsubscribeFromTopic(req: Request): Promise<{ success: boolean; message: string }> {
        try {
            const {token, topic} = req.body;

            if (!token || !topic) {
                return {success: false, message: "Please provide token and topic"};
            }

            // Format topic to match Firebase requirements: /topics/[a-zA-Z0-9-_.~%]+
            // Convert topic to string (handles both string and number inputs)
            let formattedTopic = String(topic).trim();
            if (formattedTopic.startsWith('/topics/')) {
                formattedTopic = formattedTopic.substring(8); // Remove '/topics/' prefix
            }
            // Validate topic name format (alphanumeric, dash, underscore, dot, tilde, percent)
            if (!/^[a-zA-Z0-9-_.~%]+$/.test(formattedTopic)) {
                return {success: false, message: "Topic name contains invalid characters. Only alphanumeric characters, dash, underscore, dot, tilde, and percent are allowed."};
            }
            formattedTopic = `/topics/${formattedTopic}`;

            // Unsubscribe the device from the topic
            const response = await admin.messaging().unsubscribeFromTopic([token], formattedTopic);
            console.log("Response on topic unsubscription:", response);
            
            if (response.successCount > 0) {
                return {success: true, message: `Successfully unsubscribed from topic: ${topic}`};
            } else {
                return {success: false, message: `Failed to unsubscribe from topic: ${topic}. Errors: ${JSON.stringify(response.errors)}`};
            }

        } catch (err: any) {
            console.error("Error unsubscribing from topic:", err);
            
            let errorMessage = 'Error unsubscribing from topic';
            if (err?.message) {
                errorMessage = err.message;
            }
            
            return {success: false, message: errorMessage};
        }
    }
}
