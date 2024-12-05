// "use client";
// // app/loading/loading.tsx
// import React, { useState, useEffect } from "react";
// import { useSpring, animated } from "@react-spring/web";
// import { useRouter } from "next/navigation"; // Use Next.js router for navigation

// const Loader: React.FC = () => {
//   const [count, setCount] = useState<number>(3); // State for countdown
//   const [isCountdownDone, setCountdownDone] = useState<boolean>(false); // State to track countdown completion
//   const [showQuestionPage, setShowQuestionPage] = useState<boolean>(false); // State to show question page
//   const router = useRouter(); // Use Next.js router for navigation

//   // Animation for the countdown number
//   const counterAnimation = useSpring({
//     opacity: isCountdownDone ? 0 : 1,
//     transform: isCountdownDone ? "scale(0)" : "scale(1)",
//     config: { tension: 120, friction: 14 },
//   });

//   // Animation for fading out the homepage text
//   const fadeOutAnimation = useSpring({
//     opacity: showQuestionPage ? 0 : 1,
//     transform: showQuestionPage ? "translateY(-100%)" : "translateY(0%)",
//     config: { tension: 120, friction: 14 },
//   });

//   useEffect(() => {
//     if (count > 0) {
//       const timer = setTimeout(() => setCount((prev) => prev - 1), 1000);
//       return () => clearTimeout(timer); // Cleanup the timer on component unmount
//     } else if (count === 0) {
//       const finalTimer = setTimeout(() => {
//         setCountdownDone(true);
//         setTimeout(() => {
//           setShowQuestionPage(true);
//           setTimeout(() => {
//             router.push("/assessment"); // Navigate to the assessment page
//           }, 500); // Delay to complete animation
//         }, 500); // Short delay before showing the QuestionPage
//       }, 1000);
//       return () => clearTimeout(finalTimer);
//     }
//   }, [count, router]);

//   return (
//     <div className='loading-container'>
     

//       {!showQuestionPage && (
//         <animated.div className='counter' style={counterAnimation}>
//           {count > 0 ? count : "Let's Go!"}
//         </animated.div>
//       )}
      
    
//       {!showQuestionPage && (
//         <animated.div className='sortingText' style={fadeOutAnimation}>
//           <p>The sorting hat is preparing...</p>
//         </animated.div>
//       )}

//     </div>
//   );
// };

// export default Loader;