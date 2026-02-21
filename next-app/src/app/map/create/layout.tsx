import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '지도만들기',
    description: '모임 장소를 설정하고 지도를 만듭니다.',
};

export default function MapCreateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
