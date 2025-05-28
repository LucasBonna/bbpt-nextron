"use client"

import React from "react";
import { Button } from "../ui/button";
import { v4 as uuid } from "uuid";
import { authClient } from "@/lib/auth-client";

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
                await authClient.signIn.social({
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