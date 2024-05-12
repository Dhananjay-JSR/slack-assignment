import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Navigate } from "react-router-dom";
export default function HomePage() {
  //   const dispatch = useDispatch();
  const auth_state = useSelector((state: RootState) => state.AuthReducer);

  if (!auth_state.isAuthenticated) {
    return <Navigate to={"/dashboard"} />;
  }
  return <></>;
}
