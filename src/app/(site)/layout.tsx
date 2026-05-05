import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession, isSetup } from '@/libs/auth.actions';
import { SESSION_COOKIE } from '@/libs/auth';
import Notifier from '@/components/notifier';
import NavSidebar from '@/components/navSidebar';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const valid = token ? await validateSession(token) : false;

    if (!valid) {
        const needsSetup = await isSetup();
        redirect(needsSetup ? '/setup' : '/login');
    }

    return (
        <div className="h-full flex">
            <Notifier />
            <NavSidebar />
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}
