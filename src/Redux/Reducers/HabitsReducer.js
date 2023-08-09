import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { Timestamp, addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../Tools/firebase";
import { tostify } from "../../Tools/tostify";

const initialState = {
    habits: []
}

export const addHabit = createAsyncThunk("habits/addHabit", async (payload, thunkAPI) => {

    const userUID = thunkAPI.getState().userReducer.userUID;
    const habitName = payload;

    const currentTimestamp = Timestamp.now();
    const currentDate = currentTimestamp.toDate();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;//~ 2023-08-10 time formate
    const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayOfWeek = daysOfWeek[currentDate.getDay()];

    try {
        // Adding a new user with a custom userUID
        const userCollectionRef = collection(db, "users");
        const newUserDocRef = await doc(userCollectionRef, userUID);

        // Adding a new habit with habitName as the document ID
        const habitsCollectionRef = collection(newUserDocRef, "habits");
        const newHabitDocRef = await addDoc(habitsCollectionRef, { habitName });

        // Adding days to the habit
        const daysCollectionRef = collection(newHabitDocRef, "days");
        await addDoc(daysCollectionRef, { timeStamp: currentTimestamp, date: today, day: dayOfWeek, status: "none" });

    } catch (error) {
        console.log(error)
    }
})



export const addCurrentDay = createAsyncThunk("habits/addCurrentDay", async (payload, thunkAPI) => {

    const currentTimestamp = Timestamp.now();
    const currentDate = currentTimestamp.toDate();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;//~ 2023-08-10 time formate
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysOfWeek[currentDate.getDay()];

    const daysCollectionRefPath = payload;
    await addDoc(collection(db, daysCollectionRefPath), { timeStamp: currentTimestamp, date: today, day: dayOfWeek, status: "none" });
})



export const updateHabitStatus = createAsyncThunk("habits/updateHabitStatus", async (payload, thunkAPI) => {

    const { dayReferencePath, newStatus } = payload;
    try {
        await updateDoc(doc(db, dayReferencePath), {
            status: newStatus
        });

    } catch (error) {
        tostify("error", error.message)
    }
})

export const deleteHabit = createAsyncThunk('habits/deleteHabit', async (payload, thunkApi) => {
    try {
        const HABITS = thunkApi.getState().habitsReducer.habits;
        await deleteDoc(doc(db, payload));
        if (HABITS.length === 1) {
            thunkApi.dispatch(habitsSlice.actions.emptyHabits())
        }
        tostify("sucess", "successfully Deleted")
    } catch (error) {
        tostify("error", error.message)
    }
})

const habitsSlice = createSlice({
    name: "habits",
    initialState,
    reducers: {
        "initialHabits": (state, action) => {
            state.habits = action.payload;
        },
        "updateDayData": (state, action) => {
            const { habitDocRefPath, daysData } = action.payload;
            state.habits = state.habits.map(habit => {
                if (habit.habitDocRefPath === habitDocRefPath) {
                    return {
                        ...habit,
                        days: daysData
                    };
                }
                return habit;
            });
        },
        "emptyHabits": (state, action) => {
            state.habits = []
        }
    }
});


export const habitsReducer = habitsSlice.reducer;
export const habitsAction = habitsSlice.actions;