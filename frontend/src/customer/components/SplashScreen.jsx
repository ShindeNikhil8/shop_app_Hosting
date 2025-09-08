import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Gift, ToyBrick, Gamepad2 } from "lucide-react"; // toy-like icons

const SplashScreen = ({ onFinish }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onFinish(); // notify parent to load HomePage
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!show) return null;

  // Configuration for multiple toys/gifts
  const toys = [
    { component: Gift, color: "text-pink-500", size: 60, top: "10%", left: "5%", animate: { y: [0, -30, 0] }, duration: 2 },
    { component: ToyBrick, color: "text-blue-500", size: 50, bottom: "15%", left: "10%", animate: { x: [0, 30, 0] }, duration: 3 },
    { component: Gamepad2, color: "text-green-500", size: 55, top: "20%", right: "10%", animate: { y: [0, 20, 0] }, duration: 2.5 },
    { component: Gift, color: "text-purple-500", size: 65, bottom: "25%", right: "5%", animate: { y: [0, -25, 0] }, duration: 2.2 },
    { component: ToyBrick, color: "text-yellow-500", size: 60, top: "30%", left: "30%", animate: { x: [0, 25, 0] }, duration: 3.1 },
    { component: Gamepad2, color: "text-red-500", size: 70, bottom: "20%", left: "40%", animate: { y: [0, 30, 0] }, duration: 2.7 },
  ];

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-yellow-100 to-pink-100 z-50">
      {/* Ganesha Image */}
      <motion.img
        src="https://static.vecteezy.com/system/resources/previews/011/048/407/non_2x/hindu-god-ganesha-line-art-free-png.png"
        alt="Lord Ganesha"
        className="w-64 h-64 object-contain"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Store Name */}
      <motion.h1
        className="mt-6 text-6xl md:text-7xl font-extrabold text-purple-700"
        style={{
          textShadow:
            "3px 3px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255, 255, 255, 0.6)",
        }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Shree Sai Collection
      </motion.h1>

      {/* Multiple Floating Toys/Gifts */}
      {toys.map((toy, index) => {
        const ToyComponent = toy.component;
        return (
          <motion.div
            key={index}
            className={`absolute ${toy.color}`}
            style={{ top: toy.top, bottom: toy.bottom, left: toy.left, right: toy.right }}
            animate={toy.animate}
            transition={{ repeat: Infinity, duration: toy.duration }}
          >
            <ToyComponent size={toy.size} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default SplashScreen;
