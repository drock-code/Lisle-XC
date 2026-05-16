"use client";

import { signIn } from "next-auth/react";
import { Lock } from "lucide-react";

import Button from "@/components/Button";
import { GoogleIcon } from "@/components/Icons";

export default function SignIn() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-background border border-border rounded-2xl p-8 shadow-sm text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-light-blue-gray/50 p-4 rounded-full">
            <Lock className="w-12 h-12 text-lisle-blue" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Coach Login
        </h1>
        
        <p className="text-light-gray mb-8">
          Sign in with your authorized coach account to manage roster data and race results.
        </p>

        <div className="flex flex-col gap-4">
          <Button 
            // We use standard onClick instead of 'as={Link}' here
            onClick={() => signIn("google", { callbackUrl: "/coach" })}
            isActive={true}
            size="md"
            className="w-full"
          >
            <GoogleIcon />
            Sign in with Google
          </Button>
        </div>
      </div>
    </main>
  );
}