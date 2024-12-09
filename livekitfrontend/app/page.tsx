// pages/index.tsx
"use client";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

import bgImage from "./bgfinal.jpg";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />
      <div>
        <Head>
          <title>Business Chemistry Sorting Ceremony</title>
        </Head>

        <div className="homepage" style={styles.container}>
          <h1 style={styles.title} className="p-4 ">ALCHEMISTS OF VEGAS</h1>
          <p style={styles.subtitle}>
            “Ah, yes. I know just where to put you...”
          </p>
          <button style={styles.button} onClick={() => router.push("/info")}>
            Begin your sorting
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    color: "#f97316",
    textAlign: "center",
    backgroundImage: `url(${bgImage})`,
  },

  title: {
    fontSize: "78.78px",
    fontWeight: "bold",
    marginBottom: "1rem",
    lineHeight: "69.33px",

    letterSpacing: "4%",
    textUnderlinePosition: "from-font",
    textDecorationSkipInk: "none",
    background: "linear-gradient(7.29deg, #F16E00 35.04%, #F7C729 82.89%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    fontFamily: "Bowlby One",
  },
  subtitle: {
    fontSize: "1.25rem",
    fontStyle: "italic",
    marginBottom: "2rem",
    color: "#ffffff",
  },
  button: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#f97316",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buttonHover: {
    backgroundColor: "#c65a0b",
  },
};
