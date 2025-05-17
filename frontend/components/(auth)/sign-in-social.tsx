"use client"

import React from "react";
import { Button } from "../ui/button";
import { signIn } from "@/lib/auth-client";
import { v4 as uuid } from "uuid";

export default function SignInSocial({
    provider,
    children,
}:  {
    provider:
        | "github"
        | "microsoft";
    children: React.ReactNode;
}) {
    return (
        <Button
            onClick={async () => {
                await signIn.social({
                    provider,
                    callbackURL: `/chat/${uuid()}`
                });
            }}
            type="button"
            variant="outline"
        >
            {children}
        </Button>
    );
}