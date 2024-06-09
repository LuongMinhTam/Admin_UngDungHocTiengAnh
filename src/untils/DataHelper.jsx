import {getDatabase, ref, push, onValue, remove, update} from "firebase/database"
import { FIREBASE_APP } from "./firebase-config"

const writeDataToRealTimeDB = (path, data) => {
    const db = getDatabase(FIREBASE_APP);
    const dbRef = ref(db, path);
    return push(dbRef,  data)
    .then((newDataRef) => {
        console.log("New data added with key: ", newDataRef.key);
        return newDataRef.key
    })
    .catch((error) => {
        console.error("Error adding data: ", error);
        return null;
    });
};

const readDataToRealTimeDB = (path, callback) => {
    const db = getDatabase(FIREBASE_APP);
    const dbRef = ref(db, path);
    onValue(dbRef, (snapshot) =>{
        const data = snapshot.val();
        callback(data);
    });
};

const deleteDataToRealTimeDB = async(path) => {
    try {
        const db = getDatabase(FIREBASE_APP);
        const dbRef = ref(db, path);
        await remove(dbRef);
        console.log("Data removed successfully!")
    } catch (error) {
        console.error("Error removing data: ", error);
        throw error;
    }
}

const editDataToRealTimeDB = async(path, data) => {
    try {
        const db = getDatabase(FIREBASE_APP);
        const dbRef = ref(db, path);
        await update(dbRef, data);
    } catch (error) {
        console.error("Error editing data: ", error);
        throw error;
    }
}

export {writeDataToRealTimeDB, readDataToRealTimeDB, deleteDataToRealTimeDB, editDataToRealTimeDB};