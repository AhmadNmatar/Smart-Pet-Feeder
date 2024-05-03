const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} = require("firebase-admin/auth");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase
const dbURL = "smart-pet-feeder-c7fd2.firebaseio.com";
//TODO hide URL
const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: dbURL,
});

async function handleAuthRequest(req, res) {
  const token = req.body.token;
  console.log("Received token:", token);
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;
    console.log(uid + " has logged in");

    res.json({ valid: true, message: "Received token successfully" });
  } catch (error) {
    console.error("Authentication failed:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    res.status(500).json({ valid: false, message: "Authentication failed" });
  }
}

const db = getFirestore();
async function addDocumentToCollection(collection, doc, data) {
  return db.collection(collection).doc(doc).set(data);
}
async function getDocumentfromCollection(collection, doc) {
  const docRef = db.collection(collection).doc(doc);
  const docSnapshot = await docRef.get();

  if (docSnapshot.exists) {
    return docSnapshot.data();
  } else {
    throw new Error("Document does not exist");
  }
}

async function handleSetDBRequest(req, res) {
  try {
    await addDocumentToCollection("Users", "test2", req.body);
    res.send({ Message: "Success" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ Error: "Internal Server Error" });
  }
}

async function handleGetUserRequest(req, res) {
  try {
    const userData = await getDocumentfromCollection("Users", "test2");
    res.send({ userData: userData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ Error: "Internal Server Error" });
  }
}

async function addPet(userId, petName, petType) {
  try {
    await db.collection('Users').doc(userId).collection('Pets').add({
      name: petName,
      type: petType
    });
    console.log('Pet added successfully');
  } catch (error) {
    console.error('Failed to add pet:', error);
  }
}

async function addSchedule(userId, time, amount, isActive) {
  try {
    await db.collection('Users').doc(userId).collection('Schedules').add({
      time: time,
      amount: amount,
      isActive: isActive
    });
    console.log('Schedule added successfully');
  } catch (error) {
    console.error('Failed to add schedule:', error);
  }
}

async function getSchedules(userId) {
  try {
    const scheduleCollection = db.collection('Users').doc(userId).collection('Schedules');
    const snapshot = await scheduleCollection.get();
    const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return schedules;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
}

async function getPets(userId) {
  try {
    const petsCollection = db.collection('Users').doc(userId).collection('Pets');
    const snapshot = await petsCollection.get();
    const pets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return pets;
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
}



module.exports = {
  addPet,
  addSchedule,
  handleAuthRequest,
  handleSetDBRequest,
  handleGetUserRequest,
  getPets,
  getSchedules,  
};


