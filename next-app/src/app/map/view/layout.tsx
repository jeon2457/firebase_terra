import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '지도보기',
    description: '저장된 모임 장소 지도를 확인합니다.',
};

export default function MapViewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
