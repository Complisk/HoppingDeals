"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/presentation/store";
import { hydrateFromStorage } from "@/presentation/store/authSlice";

function Hydrator() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(hydrateFromStorage());
  }, [dispatch]);
  return null;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <Hydrator />
      {children}
    </Provider>
  );
}
