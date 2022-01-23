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

let questionsServer = {};
const db = getFirestore();

router.get("/questions", async (req, res, next) => {
    const { serverCode, maxQuestions } = req.body;
    try {
        const snapshot = await db.collection("questions").get();

        let questions = [];
        if (maxQuestions) {
            snapshot.forEach((doc) => {
                // console.log(doc.id)
                // questions = Object.keys(doc.data()).sort();
                let cat = doc.data();
                let contador = 1;
                for (const question in cat) {
                    questions.push({
                        question: question,
                        addedBy: cat[question].addedBy,
                    });
                    contador++;
                    if (contador > maxQuestions) break;
                }
            });
        } else {
            snapshot.forEach((doc) => {
                // console.log(doc.id)
                // questions = Object.keys(doc.data()).sort();
                let cat = doc.data();
                for (const question in cat) {
                    questions.push({
                        question: question,
                        addedBy: cat[question].addedBy,
                    });
                }
            });
        }

        if (serverCode !== undefined) questionsServer[serverCode] = questions;
        res.json(questions);
    } catch (error) {
        next(error);
    }
});

router.post("/new-question", async (req, res, next) => {
    const { question, name, lastname } = req.body;
    try {
        const docRef = await db
            .collection("questions")
            .doc("cat1")
            .update({
                [question]: {
                    addedBy: `${name} ${lastname}`,
                    timestamp: FieldValue.serverTimestamp(),
                },
            });

        console.log(`new question added by ${name} ${lastname}`);
        res.send(`new question added by ${name} ${lastname}`);
    } catch (error) {
        next(error);
    }
});

router.post("/new-questions", async (req, res, next) => {
    const { questions, username } = req.body;
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

router.post("/questions-server", async (req, res, next) => {
    const { serverCode } = req.body;
    try {
        res.json(questionsServer[serverCode]);
    } catch (error) {
        next(error);
    }
});

router.post("/delete-questions", async (req, res, next) => {
    const { serverCode } = req.body;
    try {
        delete questionsServer[serverCode];
        console.log(`questions from room ${serverCode} deleted`);
        res.send(`questions from room ${serverCode} deleted`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
