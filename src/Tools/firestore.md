* **doc:** The doc function is used to create a reference to a specific document within a collection. It takes the path to the collection and document as arguments. This reference can be used to read, update, or delete the document's data.
```js
const documentRef = doc(db, "collectionName", "documentId");
```

* **addDoc:** The addDoc function is used to add a new document to a collection. It takes a reference to the collection and the data to be added as arguments. Firestore generates a unique document ID and stores the provided data.

```js
const collectionRef = collection(db, "collectionName");
const newDocRef = await addDoc(collectionRef, { field1: "value1", field2: "value2" });
```

* **setDoc:** The setDoc function is used to overwrite the entire document's data with new data. It takes a reference to the document and the new data as arguments. This function can be used to create a new document or completely replace an existing one.

```js
const documentRef = doc(db, "collectionName", "documentId");
await setDoc(documentRef, { newField: "newValue" });
```
* **updateDoc:** The updateDoc function is used to update specific fields within an existing document. It takes a reference to the document and an object containing the fields and values to be updated as arguments. Only the specified fields will be updated, and the rest of the document will remain unchanged.
```js
const documentRef = doc(db, "collectionName", "documentId");
await updateDoc(documentRef, { field1: "newValue1", field2: "newValue2" });
```

For example, if you have a document with fields field1, field2, and field3, and you want to update the value of field1, you can use updateDoc:

```js
const documentRef = doc(db, "collectionName", "documentId");
await updateDoc(documentRef, { field1: "newUpdatedValue" });
```

Keep in mind that the updateDoc function will only work on existing documents. If the specified document doesn't exist, the function call will have no effect.

> In summary:

* doc creates a reference to a specific document.
* addDoc adds a new document to a collection.
* setDoc sets new data for a document or creates a new document if it doesn't exist.

# what if documentId/collection/subCollection not exist?

* If the document with the provided ID (userUID in this case) does not exist in the specified collection (userCollectionRef), the doc function will still return a reference to that non-existent document. This means you can use this reference to interact with the document, even if it doesn't actually exist in the Firestore database.

* The same principle applies to both collection and subcollections. If you use the collection function to get a reference to a collection (or subcollection) that doesn't exist in the Firestore database, the function will still return a reference to that non-existent collection. You can use this reference to perform operations like creating the collection or interacting with it.

*In Firestore, you cannot directly create a document inside another document. Firestore organizes data into collections and documents, and subcollections are used to achieve a nested structure. So, if you want to create a document inside another document, you need to create a subcollection within the parent document and then add a document to that subcollection.

```js
const newUserDocRef = doc(userCollectionRef, userUID);
// Try to update the document, even if it doesn't exist yet
await setDoc(newUserDocRef, { username: "newUsername" });
```
In this case, if the document with ID userUID doesn't exist, Firestore will create it and set the username field to "newUsername". If the document already exists, the data will be updated.
```js
const userCollectionRef = collection(db, "users");
await addDoc(userCollectionRef, { username: "newUser" });
```


---
```js
const userCollectionRef = collection(db, "users");
const newUserDocRef = await addDoc(userCollectionRef, { username: userUID });
```
* Here, you're using the collection function to get a reference to the "users" collection, and then you're using the addDoc function to add a new document to that collection. The addDoc function automatically generates a unique ID for the new document and assigns the data object { username: userUID } to it.

---

```js
const userCollectionRef = collection(db, "users");
const newUserDocRef = await addDoc(userCollectionRef, { username: userUID }, userUID);
```

* In this code, the third argument of the addDoc function is the custom document ID you want to assign, which is the userUID in your case. This will create a document with the specified ID in the "users" collection and set the data as { username: userUID }.

* This way, the document ID will be the same as the userUID value.
---
```js
const userCollectionRef = collection(db, "users");
const newUserDocRef = await addDoc(userCollectionRef, null, userUID);
```

* This will create an empty document in the "users" collection with the document ID set to the userUID
---
> single line
```js
const newUserDocRef = await addDoc(collection(db, "users"), null, userUID);
```
---

```js
const userUID = "yourUserUID"; // Replace with the actual user UID
const habitName = "Exercise"; // Replace with the actual habit name

// Adding a new user with a custom userUID
const userCollectionRef = collection(db, "users");
const newUserDocRef = await addDoc(userCollectionRef, { username: userUID }, userUID);

// Adding a new habit with habitName as the document ID
const habitsCollectionRef = collection(newUserDocRef, "habits");
const newHabitDocRef = await addDoc(habitsCollectionRef, { habitName }, habitName);

// Adding days to the habit
const daysCollectionRef = collection(newHabitDocRef, "days");
const newDayDocRef = await addDoc(daysCollectionRef, { date: "2023-08-10" });

// Adding data to the day
const dataCollectionRef = collection(newDayDocRef, "data");
await addDoc(dataCollectionRef, { status: "done" });

```
In this code, we're using the userUID as the custom document ID for the user and the habitName as the document ID for the habit. 
```js
users (collection)
  └─ userID (document)
       └─ username: userUID
       └─ habits (subcollection)
            └─ habitID (document)
                 └─ habitName: payload
                 └─ days (subcollection)
                      └─ dayDocument (document)
                           └─ date: timestamp
                           └─ data (subcollection)
                                └─ dataDocument (document)
                                     └─ status: "none"
```
---

```js
     //here i am creating new habit and then today's status as none for that habit
     await addDoc(collection(doc(db, "users", userUID, "habits", payload), "day"), {
          status: "none",
          date: timestamp,
     });
```
```js
     // Get a reference to the habit document
     const habitDocRef = doc(db, "users", userUID, "habits", payload);

     // Create a subcollection reference within the habit document
     const dayCollectionRef = collection(habitDocRef, "day");

     // Add a new document with status and date in the subcollection
     await addDoc(dayCollectionRef, {
          status: "none",
          date: timestamp,
     });
```

---

```js
unsubscribe = await onSnapshot(collection(db, "users", userUID, "habits"), async (querySnapshot) => {
    if (!querySnapshot.empty) {
        const initialHabitsData = [];

        for (let i = 0; i < querySnapshot.docs.length; i++) {
            const habitDoc = querySnapshot.docs[i];
            const habitData = habitDoc.data();
            const daysCollectionRef = collection(habitDoc.ref, "days");
            const daysQuerySnapshot = await getDocs(daysCollectionRef);
            const daysData = [];

            daysQuerySnapshot.forEach((dayDoc) => {
                daysData.push({ id: dayDoc.id, ...dayDoc.data() });
            });

            initialHabitsData.push({
                id: habitDoc.id,
                habitName: habitData.habitName,
                days: daysData
            });
        }

        dispatch(habitsAction.initialHabits(initialHabitsData));
    }
});
```

const habitDoc = querySnapshot.docs[i];: This line retrieves the i-th document from the querySnapshot array. querySnapshot.docs is an array of QueryDocumentSnapshot objects, each representing a document in the collection.

const habitData = habitDoc.data();: Here, we're extracting the data stored in the habitDoc using the .data() method. This will give us an object containing all the fields and values stored in that document.

const daysCollectionRef = collection(habitDoc.ref, "days");: We're creating a reference to the days subcollection within the current habit document. habitDoc.ref is the reference to the habit document, and we're extending it to point to the subcollection called "days".

Each QueryDocumentSnapshot object (habitDoc) contains a reference (ref) to the actual document it represents in the Firestore database. This reference can be used to access and manipulate the data within that document, as well as to create subcollections or perform other operations related to that specific document. In your code, you're using the habitDoc.ref reference to create a reference to the days subcollection within each habit document. This way, you can interact with the subcollection associated with each habit.

---

# snapshot

when you apply a snapshot listener to a collection in Firestore, you only get real-time updates for the documents within that specific collection. Subcollections are separate entities in Firestore, and applying a snapshot listener to a parent collection does not automatically provide real-time updates for the documents within its subcollections.

If you want to receive real-time updates for documents within a subcollection, you would need to separately apply a snapshot listener to that subcollection as well. Firestore's real-time updates work on a per-collection basis, and you need to explicitly set up listeners for each collection or subcollection that you want to monitor for changes.

---