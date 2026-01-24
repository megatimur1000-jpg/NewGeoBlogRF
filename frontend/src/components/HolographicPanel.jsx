import React from 'react';
import { motion } from 'framer-motion';
import '../styles/HolographicUI.css';

const galacticEmojis = ['🌟', '☄️', '🪐'];

export default function HolographicPanel({ activeGalaxy }) {
  const panelVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="holo-panel"
      variants={panelVariants}
      initial="hidden"
      animate={activeGalaxy ? 'visible' : 'hidden'}
    >
      {activeGalaxy ? (
        <>
          <h2 className="holo-text">{activeGalaxy.name}</h2>
          <p>Исследуй свои достижения и зажги новые звезды! 🌟</p>
          <div className="emoji-container">
            {galacticEmojis.map((emoji, i) => (
              <span key={i} className="galactic-emoji">{emoji}</span>
            ))}
          </div>
        </>
      ) : (
        <p>Выбери галактику, чтобы узнать больше!</p>
      )}
    </motion.div>
  );
}