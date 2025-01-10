// app/layout.tsx

"use client"; // Ensure this is a client component

import React from 'react';
import { UserProvider } from './context/UserContext';
import './globals.css'; // Your global styles

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
