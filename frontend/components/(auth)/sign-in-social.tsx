"use client"

import React from "react";
import { Button } from "../ui/button";
import { signIn } from "@/lib/auth-client";
import { v4 as uuid } from "uuid";

type SignInSocialProps = {
    provider: "github" | "microsoft";
    children: React.ReactNode;
    className?: string;
}

export default function SignInSocial({
    provider,
    children,
    className,
}:  SignInSocialProps) {
    return (
        <Button
            onClick={async () => {
                await signIn.social({
                    provider,
                    callbackURL: `/chat/${uuid()}`
                });
            }}
            type="button"
            className={className}
        >
            {children}
        </Button>
    );
}