import React from 'react'
import css from "../../css/WeeklyHabit.module.css"
import { useSelector } from 'react-redux';
import { habitsSelector } from '../../Redux/Selectors';
import WeeklyHabitStatusComponent from './WeeklyHabitStatusComponent';

export default function DailyHabitComponent() {

    const HABITS = useSelector(habitsSelector);


    return (<>
        <div className={css.title}>
            <div>sun</div>
            <div>mon</div>
            <div>tue</div>
            <div>wed</div>
            <div>thu</div>
            <div>fri</div>
            <div>sat</div>
        </div>
        <div className={css.habitsContainer}>
            {HABITS && HABITS.map((habit, index) => <WeeklyHabitStatusComponent key={index} habit={habit} />)}
        </div>
    </>)
}