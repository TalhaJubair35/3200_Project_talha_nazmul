import {createBrowserRouter} from "react-router-dom";
import App from "../App";
import Home from "../assets/Pages/Home";
import About from "../assets/Pages/About";
import CreateJob from "../assets/Pages/CreateJob";
import MyJobs from "../assets/Pages/MyJobs";
import SalaryPage from "../assets/Pages/SalaryPage";
import UpdateJob from "../assets/Pages/UpdateJob";
import Login from "../components/Login";
import JobDetails from "../assets/Pages/JobDetails";
import Signup from "../components/Signup";
import NotFound from "../assets/Pages/NotFound";
import PrivateRoute from "../components/PrivateRoute";
import AdminRoute from "../components/AdminRoute";
import ForgotPassword from "../components/ForgotPassword";
import Companies from "../assets/Pages/Companies";
import EditProfile from "../assets/Pages/EditProfile";
import TalentPool from "../assets/Pages/TalentPool";
import Analytics from "../assets/Pages/Analytics";
import ManageAdmins from "../assets/Pages/ManageAdmins";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const router = createBrowserRouter([
    {
      path: "/",
      element: <App/>,
      children: [
        { path: "/", element: <Home/> },
        { path: "/companies", element: <Companies/> },
        {
          path: "/profile",
          element: <PrivateRoute><EditProfile/></PrivateRoute>
        },
        {
          path: "/talent",
          element: <AdminRoute><TalentPool/></AdminRoute>
        },
        {
          path: "/analytics",
          element: <AdminRoute><Analytics/></AdminRoute>
        },
        {
          path: "/manage-admins",
          element: <AdminRoute><ManageAdmins/></AdminRoute>
        },
        {
          path: "/post-job",
          element: <AdminRoute><CreateJob/></AdminRoute>
        },
        {
          path: "/my-job",
          element: <PrivateRoute><MyJobs/></PrivateRoute>
        },
        {
          path: "/salary",
          element: <SalaryPage/>
        },
        {
          path: "/edit-job/:id",
          element: <AdminRoute><UpdateJob/></AdminRoute>,
          loader: ({params}) => fetch(`${API_BASE_URL}/all-jobs/${params.id}`)
        },
        {
          path: "/job/:id",
          element: <JobDetails/>
        },
        {
          path: "*",
          element: <NotFound/>
        }
      ],
    },
    {
      path: "/login",
      element: <Login/>
    },
    {
      path: "/sign-up",
      element: <Signup/>
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword/>
    }
  ]);

  export default router;

