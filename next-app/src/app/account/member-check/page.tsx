import { Suspense } from 'react';
import ClientContent from './ClientContent';

interface PageProps {
    searchParams?: Promise<{
        members?: string;
        year?: string;
    }>;
}

export default async function MemberCheckPage({ searchParams }: PageProps) {
    const resolvedParams = await searchParams;
    const memberIds = resolvedParams?.members || '';
    const year = resolvedParams?.year ? parseInt(resolvedParams.year) : new Date().getFullYear();

    return (
        <Suspense fallback={<div className="text-center mt-5">Loading...</div>}>
            <ClientContent memberIds={memberIds} year={year} />
        </Suspense>
    );
}