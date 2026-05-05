import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession, isSetup } from '@/libs/auth.actions';
import { SESSION_COOKIE } from '@/libs/auth';

export default async function Home() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const valid = token ? await validateSession(token) : false;

    if (valid) redirect('/http-hosts');

    const needsSetup = await isSetup();
    redirect(needsSetup ? '/setup' : '/login');
}
