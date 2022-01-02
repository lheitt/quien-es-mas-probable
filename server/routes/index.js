const { Router } = require("express");
const router = Router();
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");
require("dotenv").config();

const serviceAccount = {
    type: process.env.NODE_FIREBASE_TYPE,
    project_id: process.env.NODE_FIREBASE_PROJECT_ID,
    private_key_id: process.env.NODE_FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.NODE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.NODE_FIREBASE_CLIENT_EMAIL,
    client_id: process.env.NODE_FIREBASE_CLIENT_ID,
    auth_uri: process.env.NODE_FIREBASE_AUTH_URI,
    token_uri: process.env.NODE_FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.NODE_FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.NODE_FIREBASE_CLIENT_X509_CERT_URL,
};

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

router.get("/questions", async (req, res, next) => {
    try {
        const snapshot = await db.collection("questions").get();

        snapshot.forEach((doc) => {
            // console.log(doc.id)
            questions = Object.keys(doc.data()).sort();
        });

        res.json(questions);
    } catch (error) {
        next(error);
    }
});

router.post("/new-question", async (req, res, next) => {
    const { question, username } = req.body;
    try {
        const docRef = await db
            .collection("questions")
            .doc("cat1")
            .update({
                [question]: {
                    addedBy: username,
                    timestamp: FieldValue.serverTimestamp(),
                },
            });

        res.send("new question added to firebase db");
    } catch (error) {
        next(error);
    }
});

router.post("/new-questions", async (req, res, next) => {
    const { questions, username } = req.body;
    console.log(questions);
    try {
        const batch = db.batch();
        const sfRef = db.collection("questions").doc("cat1");
        questions.forEach((question) => {
            batch.update(sfRef, {
                [question]: {
                    addedBy: username,
                    timestamp: FieldValue.serverTimestamp(),
                },
            });
        });
        await batch.commit();

        res.send(`${questions.length} new questions added to firebase db`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
