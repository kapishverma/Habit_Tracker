import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./Reducers/UserReducer";
import { habitsReducer } from "./Reducers/HabitsReducer";

const store = configureStore({
    reducer: {
        userReducer,
        habitsReducer,
    }
})

export default store;