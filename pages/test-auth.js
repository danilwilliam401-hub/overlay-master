import { useSession, signIn, signOut } from 'next-auth/react';

export default function TestAuth() {
  const { data: session, status } = useSession();

  console.log('Session status:', status);
  console.log('Session data:', session);
  console.log('Environment check:', {
    hasGoogleId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    hasNextAuthUrl: !!process.env.NEXT_PUBLIC_NEXTAUTH_URL
  });

  if (status === 'loading') {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (session) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>✅ Signed In</h1>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <button onClick={() => signOut()} style={{ padding: '10px 20px', marginTop: '20px' }}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>❌ Not Signed In</h1>
      <p>Click the buttons below to test sign-in:</p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => signIn('google')} 
          style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign In with Google
        </button>
        
        <button 
          onClick={() => signIn('credentials', { email: 'test@example.com', password: 'password' })} 
          style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sign In with Credentials (Test)
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>Debug Info:</h3>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>NextAuth URL:</strong> {process.env.NEXT_PUBLIC_NEXTAUTH_URL || 'Not set'}</p>
        <p><strong>Check browser console for detailed errors</strong></p>
      </div>
    </div>
  );
}
