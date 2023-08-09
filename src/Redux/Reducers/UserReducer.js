import { tostify } from "../../Tools/tostify";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";


const initialState = {
    userUID: localStorage.getItem("userUID") ? localStorage.getItem("userUID") : null,
}


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


export const logOut = createAsyncThunk("userReducer/logOut", async (payload, thunkAPI) => {

    const auth = getAuth();
    signOut(auth).then(() => {

        localStorage.removeItem("userUID");
        tostify("success", "Sign-out successful")
    }).catch((error) => {

        tostify("error", `An error happened 😵‍💫`)
    });
})


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder.addCase(logOut.fulfilled, (state, action) => {
            state.userUID = null;
        }).addCase(signIn.fulfilled, (state, action) => {
            state.userUID = action.payload;
        })
    }
})

export const userReducer = userSlice.reducer;
export const userAction = userSlice.actions;
