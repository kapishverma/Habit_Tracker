import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AddHabit from "./Components/AddHabit";
import AllHabits from "./Components/AllHabits";
import NavBar from "./Components/NavBar";
import SignUp from "./Components/SignUp";
import SignIn from "./Components/SignIn";
import DailyHabitComponent from "./Components/Daily/DailyHabitComponent";
import WeeklyHabitComponent from "./Components/Weekly/WeeklyHabitComponent";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  const BrowserRouter = createBrowserRouter([
    {
      path: '/', element: <NavBar />, children: [
        {
          path: "/", element: <AllHabits />, children: [
            { path: "/", element: <DailyHabitComponent /> },
            { path: "weeklyView", element: <WeeklyHabitComponent /> },
          ]
        },
        { path: "addHabit", element: <AddHabit /> },
        { path: "signIn", element: <SignIn /> },
        { path: "SignUp", element: <SignUp /> },
      ]
    }
  ])
  return (
    <>
      <RouterProvider router={BrowserRouter} />
      <ToastContainer />
    </>
  );
}

export default App;
