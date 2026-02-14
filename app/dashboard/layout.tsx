'use client';

import React from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { ToastProvider } from '@/components/Toaster';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </ToastProvider>
    );
}
