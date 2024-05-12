import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { login, logout } from "../store/AuthStore";

export function Callback() {
  let [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const session = searchParams.get("session");
    if (session) {
      dispatch(login(session));
      navigate("/dashboard");
    } else {
      dispatch(logout());
      navigate("/");
    }
  }, []);

  return <></>;
}
