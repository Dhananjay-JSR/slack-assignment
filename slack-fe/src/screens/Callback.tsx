import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, logout } from "../store/AuthStore";

export function Callback() {
  const [searchParams, setSearchParam] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const session = searchParams.get("session");
    if (session) {
      dispatch(login());
      navigate("/dashboard");
    } else {
      dispatch(logout());
      navigate("/");
    }
  }, []);

  return <></>;
}
