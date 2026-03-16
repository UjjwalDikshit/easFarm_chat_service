import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import { useDispatch } from "react-redux";
import { checkMe } from "./store/authSlice";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkMe());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
    </Routes>
  );
}