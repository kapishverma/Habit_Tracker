import React from 'react'
import css from "../../css/WeeklyHabit.module.css"
import { collection, query, where, Timestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { useState } from 'react';
import { useEffect } from 'react';
import { db } from '../../Tools/firebase';
import { useDispatch } from 'react-redux';
import { addCurrentDay, deleteHabit, habitsAction, updateHabitStatus } from '../../Redux/Reducers/HabitsReducer';
import { tostify } from '../../Tools/tostify';

export default function WeeklyHabitStatusComponent(props) {
    const dispatch = useDispatch();

    const [currentWeek, setCurrentWeek] = useState(null);

    const { habit } = props;
    const { habitName, habitDocRefPath, daysCollectionRefPath } = habit;

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



    return (<>
        <div className={css.container}>
            <div className={css.habitDetail}>
                <div className={css.habitName}><h3>{habitName}</h3></div>
                <div onClick={() => handleDelete()} className={css.delete}><i className="bi bi-trash"></i></div>
            </div>
            <div className={css.weeklyDetail}>
                {currentWeek &&
                    currentWeek.map((dayData, index) =>
                        <div key={index}
                            onClick={() => handleStatusUpdate(dayData)}
                            style={{ backgroundColor: `${dayData.status === "done" ? "green" : dayData.status === "none" ? "grey" : "red"}` }}>
                            {dayData.date.split("-")[2]}
                        </div>)
                }
            </div>
        </div>
    </>)
}
