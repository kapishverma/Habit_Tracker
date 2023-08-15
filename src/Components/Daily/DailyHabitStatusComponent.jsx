import React, { useEffect, useState } from 'react'
import css from "../../css/Habit.module.css"
import none from "../../Image/circle.png";
import notDone from "../../Image/cross.png";
import done from "../../Image/star.png"
import { useDispatch } from 'react-redux';
import { addCurrentDay, habitsAction, updateHabitStatus } from '../../Redux/Reducers/HabitsReducer';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../Tools/firebase';


export default function DailyHabitStatusComponent(props) {

    const dispatch = useDispatch();

    const [currentDay, setCurrentDay] = useState(null);
    const { habitName, habitDocRefPath, daysCollectionRefPath } = props.habit;

    useEffect(() => {
        let unsubscribe;

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;//~ 2023-08-10 time formate

        const q = query(collection(db, daysCollectionRefPath), where("date", "==", today));

        async function callMe() {
            try {
                unsubscribe = onSnapshot(q, async (daysQuerySnapshot) => {

                    const daysData = [];
                    if (!daysQuerySnapshot.empty) {
                        daysQuerySnapshot.forEach(async (dayDoc) => {

                            const dayReferencePath = dayDoc.ref.path; // used to uniquely identify a document
                            const { date, status } = dayDoc.data();//~Timestamp object from Firebase. Redux requires that all values in the state tree be
                            //~serializable, meaning they can be easily converted to a plain JavaScript object.convert the Timestamp object to a serializable
                            //~format before storing it in the Redux state. but i remove that
                            daysData.push({ id: dayDoc.id, date, status, dayReferencePath });
                            await setCurrentDay({ id: dayDoc.id, ...dayDoc.data(), dayReferencePath });
                        })
                    } else {//first day of week,thats whay if condintion daysQuerySnapshot is empty,so add today data
                        console.log("updated")
                        await dispatch(addCurrentDay(daysCollectionRefPath));
                    }
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
    }, [habitDocRefPath]);




    const handleHabitStatus = async () => {
        const newStatus = (currentDay.status === "done" ? "not_done" : currentDay.status === "not_done" ? "none" : "done");
        // Dispatch an action to update the status of the habit in Redux store
        await dispatch(updateHabitStatus({ dayReferencePath: currentDay.dayReferencePath, newStatus }));
    }



    return (<>
        {currentDay && < div className={css.container} >
            <div className={css.habitDetail}>
                <h3>{habitName}</h3>
            </div>
            <div onClick={() => handleHabitStatus()} className={css.btn}>
                <img src={currentDay.status === "done" ? done : currentDay.status === "not_done" ? notDone : none} alt="" />
            </div>
        </ div>}
    </>)
}
