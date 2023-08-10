# Topics
* [**SignUp**](#signup)
* [**SignIn**](#signin)
* [**Add Habit**](#add-habit)
* [**Daily View**](#daily-view-realtime-update)
* [**Weekly View**](#weekly-view-realtime-update)
* [**Edit Habit Status**](#edit-habit-status)
* [**LogOut**](#logout)

># SignUp
In the **handleSignUp** function, the dispatch function is used to call the **signUp** action creator with an object containing the email and password as parameters.

```js
    const handleSignUp = async (e) => {
        await dispatch(signUp({ email, password }));
        const tempEmail = localStorage.getItem("email");
        //~if signUp is successful , setting email value in localStorage, if its value is same means navigate to signIn page
        if (tempEmail === email) {
            navigate('/signIn')
        }
    }
```
#### signUp action creater Inside UserReducer.js
 **signUp** action creator handles the process of creating a new user account using Firebase authentication and provides visual feedback to the user through toast notifications.

```js
export const signUp = createAsyncThunk("userReducer/signUp", async (payload, thunkAPI) => {

    const auth = getAuth();
    const { email, password } = payload;
    try {
        await createUserWithEmailAndPassword(auth, email, password);

        localStorage.setItem("email", email);
        localStorage.setItem("password", password);

        tostify("success", "SignUp Successful 🥳")

    } catch (error) {
        tostify("error", `${error.message} 😵‍💫`)
    }
})
```
---
># SignIn
In the **handleSingIn** function, the dispatch function is used to call the **signIn** action creator with an object containing the email and password as parameters.

```js
  const handleSingIn = async (e) => {
    e.preventDefault();
    await dispatch(signIn({ email, password }));

    const userUID = localStorage.getItem("userUID");
    if (userUID) {
      navigate('/')
    }
  }
  ```

#### signIn action creater inside UserReducer.js
**signIn** action creator handles user sign-in using Firebase authentication, stores relevant user data in local storage, and provides visual feedback through toast notifications.

```js

export const signIn = createAsyncThunk("userReducer/signIn", async (payload, thunkAPI) => {

    const auth = getAuth();
    const { email, password } = payload;

    try {
        await signInWithEmailAndPassword(auth, email, password);

        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
        localStorage.setItem("userUID", auth.currentUser.uid);

        tostify("success", "SignIn Successful 👍")

        return auth.currentUser.uid;

    } catch (error) {
        tostify("error", `${error.message} 😵‍💫`)
    }
})
```

* if the sign-in is successful, it Store the user's email, password, and unique user identifier (userUID) in the local storage.

---
# Add Habit

```js
const handleAddHabit = (e) => {
    e.preventDefault();
     const habitName = habitNameRef.current.value;
        dispatch(addHabit(habitName));
         navigate("/")
    }

```
>### addHabit inside HabitReducer.js

**addhabit** will perform the following steps:

* It will create a new document in the "habits" collection for the specific user in Firebase.
* Inside the newly created "habits" document, it will create a new subcollection called "days."
* Within the "days" subcollection, it will add a new document representing the current day.
* This document will include the following details:
   * **timeStamp:** The current timestamp.
   * **date:** The formatted string representing today's (e.g., "2023-08-10").
   * **day:** The day of the week (e.g., "wed").
   * **status:** The initial status set to "none.

 after the habit is created, you will have a new habit document in Firebase with a subcollection of days. The first day entry in the "days" subcollection will have the current day's timestamp, date, day of the week, and an initial status of "none." This structure allows you to track the progress and status of each habit over time.
```js
export const addHabit = createAsyncThunk("habits/addHabit", async (payload, thunkAPI) => {

    const userUID = thunkAPI.getState().userReducer.userUID;
    const habitName = payload;

    // Get the current timestamp and date
    const currentTimestamp = Timestamp.now();
    const currentDate = currentTimestamp.toDate();

    // Extract year, month, and day from the current date
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    // Create a formatted string for today's date
    const today = `${year}-${month}-${day}`;

    // Define an array of days of the week
    const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    // Get the day of the week based on the current date
    const dayOfWeek = daysOfWeek[currentDate.getDay()];

    try {
        // Reference to the user's collection
        const userCollectionRef = collection(db, "users");
        const newUserDocRef = await doc(userCollectionRef, userUID);

        // Reference to the habits collection within the user's document
        const habitsCollectionRef = collection(newUserDocRef, "habits");
        const newHabitDocRef = await addDoc(habitsCollectionRef, { habitName });

        // Reference to the days collection within the habit's document
        const daysCollectionRef = collection(newHabitDocRef, "days");

        // Add a new document representing the current day
        await addDoc(daysCollectionRef, {
            timeStamp: currentTimestamp,
            date: today,
            day: dayOfWeek,
            status: "none"
        });

    } catch (error) {
        console.log(error)
    }
})

```
**In summary**, the addHabit asynchronous thunk handles the process of creating a new habit document in Firebase, along with a subcollection of days associated with the habit. It captures details like the habit name, current date, and day of the week for the initial day entry.

---
># All habits RealTime Update

 this code sets up a subscription to the user's "habits" collection in Firestore. When changes occur in the collection, the data is fetched and stored in Redux state using the initialHabits action. The subscription is unsubscribed when the component is unmounted to avoid memory leaks

```js
useEffect(() => {
    let unsubscribe; // Declare a variable to store the unsubscribe function

    async function initialHabits() {
        try {
            unsubscribe = onSnapshot(collection(db, "users", userUID, "habits"), async (querySnapshot) => {
                const habitsData = [];


                if (!querySnapshot.empty) {

                   for (const habitDoc of querySnapshot.docs) {
                        const habitData = habitDoc.data();
                        // daysCollectionRef will help to get doc from each habit days collection
                        const daysCollectionRef = collection(habitDoc.ref, "days");

                        // Push habit data into the habitsData array
                        habitsData.push({
                            habitName: habitData.habitName,
                            habitDocRefPath: habitDoc.ref.path, // habit doc path ,help in delete
                            daysCollectionRefPath: daysCollectionRef.path,
                        });
                    }
                    // Dispatch the initialHabits action with the fetched data
                    await dispatch(habitsAction.initialHabits(habitsData));
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    initialHabits();
    return () => {
        if (unsubscribe) {
            unsubscribe(); 
        }
    };
}, [userUID]);

```
---
># Daily View RealTime Update

* A query is created to fetch documents from Firestore that match the current date.
* Inside the callMe function, a subscription is set up to listen for changes in the query result.
* When there are changes, the code iterates through the fetched documents.
* If a document has the same date as today, a flag is set to indicate its existence.
* If such a document is found, it's used to update Redux state using the updateDayData action.
* If no document exists for today, the addCurrentDay action is dispatched to add one.


```js
useEffect(() => {
    let unsubscribe;

    // Get the current date in the format "YYYY-MM-DD"
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    // Create a query to fetch documents with the current date
    const q = query(collection(db, daysCollectionRefPath), where("date", "==", today));

    async function callMe() {
        try {
            unsubscribe = onSnapshot(q, async (daysQuerySnapshot) => {

                const daysData = [];
                let setCurrentDayHelper = false; // Indicates if today's doc exists

                if (!daysQuerySnapshot.empty) {
                    daysQuerySnapshot.forEach(async (dayDoc) => {

                        const dayReferencePath = dayDoc.ref.path;
                        //each day's doc reference help in update status
                        const { date, status } = dayDoc.data();
                        daysData.push({ id: dayDoc.id, date, status, dayReferencePath });

                        if (date === today) {
                            setCurrentDayHelper = true;
                            await setCurrentDay({ id: dayDoc.id, ...dayDoc.data(), dayReferencePath });
                        }
                    })
  
                    if (setCurrentDayHelper) {
                        await dispatch(habitsAction.updateDayData({ habitDocRefPath, daysData }));
                    } else {
                        console.log("updated");//means current day is not in firestore, have to create new doc with current day status
                        await dispatch(addCurrentDay(daysCollectionRefPath));
                    }
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    callMe();

    return () => {
        if (unsubscribe)
            unsubscribe();
    }
}, [habitDocRefPath]);

```
---
># Weekly View RealTime Update
the useEffect hook to fetch data from a Firestore collection for a specific week. It then processes the fetched data to fill in missing days of the week ,it ensures that data is available for each day of the week, and updates the Redux state accordingly.

* A query is set up to fetch documents from Firestore where the timeStamp is greater than or equal to the starting day of the week based on the current date, and the results are ordered by timeStamp.

* The onSnapshot function listens for changes to the query and processes the fetched documents.
* If a document's date matches the current date, the setCurrentDayHelper flag is set to true. **here when user login next day it also need to have current day status**
* The weekData array is used to store information about each day fetched from Firestore.
* The **setCurrentWeekHelperFunction** is called to further process the data.

```js
  useEffect(() => {
        let unsubscribe;
        const currentDate = new Date();

        // Set the current date to the beginning of Sunday
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0); // Set time to 12:00 AM

        // Create Timestamp from startOfWeek
        const startTimestamp = Timestamp.fromDate(startOfWeek);

        const q = query(
            collection(db, daysCollectionRefPath),
            where('timeStamp', '>=', startTimestamp),
            orderBy('timeStamp')
        );


        async function callMe() {
            try {
                unsubscribe = onSnapshot(q, async (daysQuerySnapshot) => {

                    let setCurrentDayHelper = false;//~ if this is true means, todays doc is already created
                    const weekData = [];

                    const date = new Date();
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const today = `${year}-${month}-${day}`;//~ 2023-08-10 time formate

                    if (!daysQuerySnapshot.empty) {
                        daysQuerySnapshot.forEach(async (dayDoc) => {

                            const dayReferencePath = dayDoc.ref.path; // used to uniquely identify a document
                            const { date, status, day } = dayDoc.data();

                            weekData.push({ id: dayDoc.id, date, status, day, dayReferencePath });

                            if (date === today) {
                                setCurrentDayHelper = true;
                            }
                        })
                        if (setCurrentDayHelper) {
                            await dispatch(habitsAction.updateDayData({ habitDocRefPath, weekData }));
                            setCurrentWeekHelperFunction(weekData);
                        } else {
                            await dispatch(addCurrentDay(daysCollectionRefPath));
                        }
                    }
                    // else {
                    //     return;
                    // }
                });
            } catch (error) {
                console.log(error)
            }
        }
        callMe();

        return () => {
            if (unsubscribe)
                unsubscribe();
        }
    }, [habitDocRefPath, dispatch, daysCollectionRefPath]);

```
#### setCurrentWeekHelperFunction:

* This function processes the fetched weekData to ensure there's data for every day of the week.
* It creates an array called modifiedData.
* For each day of the week (using the daysOfWeek array), it checks if there's data for that day in the fetched data.
* If there's no data for a day, it adds an entry with status set to "none" to the modifiedData array.
* If there's data for a day, it adds that data to the modifiedData array.
* The resulting modifiedData array ensures that there's data for each day of the week.

```js
 const setCurrentWeekHelperFunction = (fetchedData) => {
        const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        const modifiedData = [];

        let date = new Date();
        date.setDate(date.getDate() - date.getDay()); // Move to the beginning of the week

        for (const dayOfWeek of daysOfWeek) {
            const dayData = fetchedData.find(data => data.day === dayOfWeek);

            if (!dayData) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`; // e.g., "2023-08-10" format

                // Convert JavaScript date to Firebase Timestamp
                const firebaseTimestamp = Timestamp.fromDate(date);

                modifiedData.push({
                    date: formattedDate,
                    day: dayOfWeek,
                    status: "none",
                    daysCollectionRefPath,
                    timeStamp: firebaseTimestamp
                });

            } else {
                modifiedData.push(dayData);
            }
            // Move to the next day
            date.setDate(date.getDate() + 1);
        }
        setCurrentWeek(modifiedData);
    }
```

---
># Edit Habit Status
* **dispatch from Daily View**
```js
    const handleHabitStatus = async () => {
        const newStatus = (currentDay.status === "done" ? "not_done" : currentDay.status === "not_done" ? "none" : "done");
        // Dispatch an action to update the status of the habit in Redux store
        await dispatch(updateHabitStatus({ dayReferencePath: currentDay.dayReferencePath, newStatus }));
    }
```
* **dispatch from Weekly View**
```js
    const handleStatusUpdate = async (dayData) => {
        const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        let date = new Date();

        if (date.getDay() < daysOfWeek.indexOf(dayData.day)) {
            tostify("error", "Oops, hold your horses! Future updates pending")
            return;
        }

        const newStatus = (dayData.status === "done" ? "not_done" : dayData.status === "not_done" ? "none" : "done");
        await dispatch(updateHabitStatus({ ...dayData, newStatus }));
    }


    const handleDelete = async () => {
        await dispatch(deleteHabit(habitDocRefPath));
    }
 ```

simple function , using dayReferencePath just it has to update status for current day, else ,if that date has not been created yet, then create a new document 

```js
export const updateHabitStatus = createAsyncThunk("habits/updateHabitStatus", async (payload, thunkAPI) => {

    const { dayReferencePath, newStatus } = payload;
    try {
        if (dayReferencePath) {
            await updateDoc(doc(db, dayReferencePath), {
                status: newStatus
            });
        } else {//I need to create a new document because the status for that date has not been created yet
            const { date, day, daysCollectionRefPath, timeStamp } = payload;
            await addDoc(collection(db, daysCollectionRefPath), { timeStamp, date, day, status: newStatus });
        }
    } catch (error) {
        tostify("error", error.message)
    }
})
```
---

># LogOut
dispatch action from NavBar -> menu -> logOut
```js
    const handleLogOut = async () => {

        await dispatch(logOut())

        navigate("/signIn")
    }
```
then, inside UserReducer.js simple logout and remove userUID from localstorage
```js
export const logOut = createAsyncThunk("userReducer/logOut", async (payload, thunkAPI) => {

    const auth = getAuth();
    signOut(auth).then(() => {

        localStorage.removeItem("userUID");
        tostify("success", "Sign-out successful")
    }).catch((error) => {

        tostify("error", `An error happened 😵‍💫`)
    });
})
```
