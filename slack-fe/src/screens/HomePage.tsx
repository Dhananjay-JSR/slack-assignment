import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Link, Navigate } from "react-router-dom";
import { SERVER_URL } from "../utils/constants";
import { GoogleSignInBtn } from "../components/GoogleSigninBtn";
export default function HomePage() {
  //   const dispatch = useDispatch();
  const auth_state = useSelector((state: RootState) => state.AuthReducer);

  if (auth_state.isAuthenticated) {
    return <Navigate to={"/dashboard"} />;
  }
  return (
    <div className="bg-black/95 h-screen">
      <div className="flex justify-center items-center h-full">
        <div className="bg-white p-8 rounded-lg">
          <p className="text-black mb-2">Please Authenticate to Continue</p>
          <GoogleSignInBtn />
        </div>
      </div>
    </div>
  );
}
