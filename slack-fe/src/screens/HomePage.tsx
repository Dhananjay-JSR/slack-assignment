import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Navigate } from "react-router-dom";
import { GoogleSignInBtn } from "../components/GoogleSigninBtn";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
export default function HomePage() {
  const auth_state = useSelector((state: RootState) => state.AuthReducer);

  if (auth_state.isAuthenticated) {
    return <Navigate to={"/dashboard"} />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    toast.error("Please Login Again");
  }, []);
  return (
    <>
      <Toaster />
      <div className="bg-black/95 h-screen">
        <div className="flex justify-center items-center h-full">
          <div className="bg-white p-8 rounded-lg">
            <p className="text-black mb-2">Please Authenticate to Continue</p>
            <GoogleSignInBtn />
          </div>
        </div>
      </div>
    </>
  );
}
