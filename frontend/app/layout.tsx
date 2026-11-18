"use client";

import React, { useState } from "react";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <html lang="en">
      <head>
        <title>CBIT Resource Hub — Chaitanya Bharathi Institute of Technology</title>
        <meta
          name="description"
          content="Centralized institutional platform for managing and retrieving external resource persons associated with CBIT Hyderabad."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AppLayout>{children}</AppLayout>
        </QueryClientProvider>
      </body>
    </html>
  );
}

