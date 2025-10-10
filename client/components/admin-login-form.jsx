"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useAdminLoginMutation } from "@/features/auth/authApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/features/auth/authSlice";

export function AdminLoginForm({ className, ...props }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [
    adminLogin,
    { isError: isAdminLoginError, isLoading: isAdminLoginLoading },
  ] = useAdminLoginMutation();

  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await adminLogin({
        email: formData.email,
        password: formData.password,
      }).unwrap();

      const { token, admin } = result;

      dispatch(setCredentials({ user: admin, token }));

      toast.success("✅ Admin Login Successful");

      router.push("/admin/dashboard");
    } catch (err) {
      console.error("❌ Admin login failed:", err);
      toast.error(err?.data?.message || "❌ Failed to Admin Login");
    }
  };
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleLogin}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Admin Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button disabled={isAdminLoginLoading} type="submit" className="w-full">
          {isAdminLoginLoading ? "Login..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
