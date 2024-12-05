// pages/index.tsx
"use client";
import Head from 'next/head';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Business Chemistry Sorting Ceremony</title>
      </Head>

      <div style={styles.container}>
        <h1 style={styles.title}>Business Alchemist</h1>
        <p style={styles.subtitle}>
          “Ah, yes. I know just where to put you...”
        </p>
        <button style={styles.button} onClick={() => router.push('/info')}>
          Begin your sorting
        </button>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: '#f97316',
    textAlign: 'center',
    backgroundColor:'#000000',
    
  },

  title: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.25rem',
    fontStyle: 'italic',
    marginBottom: '2rem',
    color: '#ffffff',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#f97316',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#c65a0b',
  },
};