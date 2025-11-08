"use client";
import LoginForm from "@/components/login/LoginForm";
import React, { Suspense, useEffect } from "react";

const page = () => {
  useEffect(() => {
    document.title = "Besiks - Login";
  }, []);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
};

export default page;
