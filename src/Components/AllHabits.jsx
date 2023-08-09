import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { habitsAction } from '../Redux/Reducers/HabitsReducer';
import { onSnapshot, collection } from "firebase/firestore";
import { db } from '../Tools/firebase';
import { habitsSelector, userSelector } from '../Redux/Selectors';
import { Outlet } from 'react-router-dom';

export default function Habit() {

    const userUID = useSelector(userSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userUID) return;

        let unsubscribe;
        async function initialHabits() {
            try {

                unsubscribe = onSnapshot(collection(db, "users", userUID, "habits"), async (querySnapshot) => {
                    const habitsData = [];
                    if (!querySnapshot.empty) {
                        for (const habitDoc of querySnapshot.docs) {
                            const habitData = habitDoc.data();
                            const daysCollectionRef = collection(habitDoc.ref, "days");

                            habitsData.push({
                                habitName: habitData.habitName,
                                habitDocRefPath: habitDoc.ref.path, // Store Firestore path
                                daysCollectionRefPath: daysCollectionRef.path,
                            });
                        }
                        await dispatch(habitsAction.initialHabits(habitsData));
                    }
                });
            } catch (error) {
                console.log(error)
            }
        }

        initialHabits();

        return () => {
            if (unsubscribe)
                unsubscribe();
        }
    }, [userUID]);


    return (<>
        < div className="habitsContainer" >
            <Outlet />
        </div>
    </>
    )
}
