// app/search/layout.tsx

"use client"; // Ensure this is present if the layout uses client-side features

import React, { Suspense, ReactNode } from 'react';
import ClipLoader from "react-spinners/ClipLoader"; // Ensure ClipLoader is installed

// Define the props interface with explicit typing for 'children'
interface LayoutProps {
  children: ReactNode;
}

export default function SearchLayout({ children }: LayoutProps) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader size={50} />
      </div>
    }>
      {children}
    </Suspense>
  );
}
