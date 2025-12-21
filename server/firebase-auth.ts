import type { Request, Response, NextFunction, RequestHandler } from "express";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    // In production, use service account from environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else {
        // For local development with default credentials
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || "ananse-golden-stool",
        });
    }
}

export const adminAuth = admin.auth();

// Middleware to verify Firebase ID token
export const verifyFirebaseToken: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    const token = authHeader.split("Bearer ")[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        (req as any).user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
        };
        next();
    } catch (error) {
        console.error("Error verifying Firebase token:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

// Optional auth - doesn't fail if no token
export const optionalFirebaseAuth: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next();
        return;
    }

    const token = authHeader.split("Bearer ")[1];

    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        (req as any).user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name,
        };
    } catch (error) {
        // Ignore invalid token, continue without user
    }

    next();
};
