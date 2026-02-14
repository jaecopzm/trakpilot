'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, LayoutDashboard, BarChart3, Settings, CreditCard, ChevronLeft, ChevronRight, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
    },
    {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

export default function DashboardSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user } = useUser();

    const toggleMobile = () => setMobileOpen(!mobileOpen);
    return (
        <TooltipProvider delayDuration={0}>
            {/* Mobile Trigger */}
            <button
                onClick={toggleMobile}
                className="lg:hidden fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
            >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 lg:sticky lg:top-0 h-screen flex flex-col border-r border-sidebar-border 
                    bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out
                    ${collapsed ? 'lg:w-[68px]' : 'lg:w-[260px]'}
                    ${mobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Brand */}
                <div className={`flex items-center gap-2.5 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="bg-sidebar-primary/10 p-2 rounded-lg border border-sidebar-primary/20 shrink-0">
                        <Mail className="w-5 h-5 text-sidebar-primary" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-semibold tracking-tight">
                            MailTrackr
                        </span>
                    )}
                </div>

                <Separator className="bg-sidebar-border" />

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const linkContent = (
                            <Link
                                key={item.href}
                                href={item.badge ? '#' : item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`
                                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                                    transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                                    }
                                    ${item.badge ? 'opacity-50 cursor-not-allowed' : ''}
                                    ${collapsed ? 'justify-center px-2' : ''}
                                `}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sidebar-primary rounded-r-full" />
                                )}
                                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-sidebar-primary' : ''}`} />
                                {!collapsed && (
                                    <>
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge && (
                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-sidebar-primary/10 text-sidebar-primary border border-sidebar-primary/20">
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                            </Link>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>
                                        {linkContent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="flex items-center gap-2">
                                        {item.label}
                                        {item.badge && (
                                            <span className="text-[10px] opacity-60">({item.badge})</span>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return linkContent;
                    })}
                </nav>

                {/* Upgrade CTA */}
                {!collapsed && (
                    <div className="px-3 pb-3">
                        <div className="rounded-xl bg-gradient-to-br from-sidebar-primary/10 via-sidebar-primary/5 to-transparent border border-sidebar-primary/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-sidebar-primary" />
                                <span className="text-sm font-semibold">Upgrade to Pro</span>
                            </div>
                            <p className="text-xs text-sidebar-foreground/60 mb-3 leading-relaxed">
                                Unlock unlimited tracking, real-time alerts, and advanced analytics.
                            </p>
                            <Link href="/pricing">
                                <Button size="sm" className="w-full text-xs h-8">
                                    <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                                    View Plans
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {collapsed && (
                    <div className="px-3 pb-3 flex justify-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/pricing">
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-sidebar-primary">
                                        <Sparkles className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Upgrade to Pro</TooltipContent>
                        </Tooltip>
                    </div>
                )}

                <Separator className="bg-sidebar-border" />

                {/* Bottom: User + Collapse */}
                <div className={`px-3 py-3 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className={`flex items-center gap-3 ${collapsed ? '' : 'flex-1 min-w-0'}`}>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: 'w-8 h-8',
                                },
                            }}
                        />
                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {user?.firstName || 'User'}
                                </p>
                                <p className="text-[10px] text-sidebar-foreground/50 truncate">
                                    {user?.primaryEmailAddress?.emailAddress || ''}
                                </p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                            onClick={() => setCollapsed(true)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {collapsed && (
                    <div className="px-3 pb-3 flex justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                            onClick={() => setCollapsed(false)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </aside>
        </TooltipProvider>
    );
}
