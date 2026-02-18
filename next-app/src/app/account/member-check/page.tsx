import { Suspense } from 'react';
import ClientContent from './ClientContent';

interface PageProps {
    searchParams?: {
        members?: string;
        year?: string;
    };
}

export default function MemberCheckPage({ searchParams }: PageProps) {
    const memberIds = searchParams?.members || '';
    const year = searchParams?.year ? parseInt(searchParams.year) : new Date().getFullYear();

    return (
        <Suspense fallback={<div className="text-center mt-5">Loading...</div>}>
            <ClientContent memberIds={memberIds} year={year} />
        </Suspense>
    );
}