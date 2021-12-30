import "./App.css";
import io from "socket.io-client";
import db from "./firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { NativeBaseProvider, Box } from "native-base";

function App() {
    useEffect(async() => {
        const socket = io("http://localhost:3001", {
            reconnectionDelayMax: 10000,
            auth: {
                token: "123",
            },
            query: {
                "my-key": "my-value",
            },
        });

        const querySnapshot = await getDocs(collection(db, "questions"));
        querySnapshot.forEach((doc) => {
            console.log(doc);
            console.log(`${doc.id} => ${Object.keys(doc._document.data.value.mapValue.fields)}`);
        });
    }, []);

    return (
        <NativeBaseProvider>
            <Box>Hello world</Box>
        </NativeBaseProvider>
    );
}

export default App;
