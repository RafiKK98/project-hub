"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    await login(values);
    setIsLoading(false);
  }

  return (
    <Card className="w-full gap-6 shadow shadow-slate-300">
      <CardHeader className="gap-1">
        <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
          Sign in
        </CardTitle>
        <CardDescription>
          Enter your email and password to continue
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email?.message && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register("password")}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password?.message && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="mt-2 w-full"
          >
            Sign in
            {isLoading && <Spinner data-icon="inline-start" />}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

{
  /* <div className="flex flex-col gap-6">
  <div className="flex flex-col gap-1">
    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
      Sign in
    </h1>
    <p className="text-sm text-muted-foreground">
      Enter your email and password to continue
    </p>
  </div>

  <form
    onSubmit={handleSubmit(onSubmit)}
    className="flex flex-col gap-4"
    noValidate
  >
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="email">
        Email <span className="text-destructive">*</span>
      </Label>
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus
        aria-invalid={!!errors.email}
        {...register("email")}
      />
      {errors.email?.message && (
        <p className="text-xs text-destructive">{errors.email.message}</p>
      )}
    </div>

    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="password">
          Password <span className="text-destructive">*</span>
        </Label>
        <Link
          href="/forgot-password"
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          className="pr-10"
          {...register("password")}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      {errors.password?.message && (
        <p className="text-xs text-destructive">{errors.password.message}</p>
      )}
    </div>

    <Button
      type="submit"
      size="lg"
      disabled={isLoading}
      className="mt-2 w-full"
    >
      Sign in
      {isLoading && <Spinner data-icon="inline-start" />}
    </Button>
  </form>

  <p className="text-center text-sm text-muted-foreground">
    Don&apos;t have an account?{" "}
    <Link
      href="/register"
      className="font-medium text-foreground underline-offset-4 hover:underline"
    >
      Create one
    </Link>
  </p>
</div>; */
}
