"use client";

export default function Loading() {
    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <img 
                src="/images/clova.png" 
                alt="로고" 
                style={{ 
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    border: '4px solid rgba(255,255,255,0.3)',
                    opacity: 0.8,
                    animation: 'spin 1.5s linear infinite'
                }}
            />
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
