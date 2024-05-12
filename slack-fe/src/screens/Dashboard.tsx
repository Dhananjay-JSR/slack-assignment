import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import { SERVER_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Link, Navigate } from "react-router-dom";
import { logout } from "../store/AuthStore";

class AbourtError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export default function Dashboard() {
  const AuthState = useSelector((state: RootState) => state.AuthReducer);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const Controller = new AbortController();
    const signal = Controller.signal;
    (async () => {
      try {
        const response = await axios.get(SERVER_URL + "/profile", {
          signal,
          withCredentials: true,
        });
        console.log(response.data);
        setIsLoading(false);
      } catch (error) {
        if (error instanceof AbourtError) {
          return;
        }
        if (isAxiosError(error)) {
          if (error.response?.status === 401) {
            // Unauthorized Logout the user
            // dispatch(logout());
          }
        }
      }
    })();

    return () => {
      Controller.abort();
    };
  }, []);

  if (!AuthState.isAuthenticated) {
    return <Navigate to={"/"} />;
  }
  return (
    <div className="bg-black/95 h-screen">
      <header className="max-w-full  bg-black">
        <nav className="max-w-5xl mx-auto flex justify-between items-center py-2">
          <div className="flex items-center">
            <div className="text-white font-bold text-xl">Slack Connector</div>
          </div>
          <div className="flex items-center ">
            <div className="text-white mr-4">
              Welcome {AuthState.session_id}
            </div>
            <Link
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
              to={SERVER_URL + "/logout"}
            >
              Logout
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
}
