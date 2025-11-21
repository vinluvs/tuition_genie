// components/MainAppLayout.tsx
"use client"

import AuthGuard from '@/components/AuthGuard'; // Your auth guard component
import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarInset, SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { Separator } from './ui/separator';
import { SidebarTrigger } from './ui/sidebar';

interface MainAppLayoutProps {
  children: React.ReactNode;
}

const MainAppLayout: React.FC<MainAppLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Function to format the pathname into a readable page name
  const getPageName = (path: string): string => {
    if (!path || path === '/') return 'Home';

    // Remove leading slash and split by '/'
    const segments = path.split('/').filter(Boolean);

    // Get the last segment (current page)
    const lastSegment = segments[segments.length - 1];

    // Handle dynamic routes (e.g., [id])
    // If it's a UUID or number, use the second-to-last segment
    if (lastSegment && /^[0-9a-f-]+$/i.test(lastSegment)) {
      const parentSegment = segments[segments.length - 2];
      if (parentSegment) {
        return formatSegment(parentSegment) + ' Details';
      }
    }

    return formatSegment(lastSegment);
  };

  // Format a URL segment into a readable name
  const formatSegment = (segment: string): string => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const currentPage = getPageName(pathname);

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">
                      Tuition Genie
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <main className="grow p-6">
            {/* The protected page content (children) will render here */}
            {children}
          </main>

          <footer className="p-4 text-center text-sm">
            © 2025 Tuition Genie
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default MainAppLayout;