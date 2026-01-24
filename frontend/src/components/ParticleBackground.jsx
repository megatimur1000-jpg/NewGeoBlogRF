import React from 'react';
import '../styles/ParticleSystem.css';

export default function ParticleBackground() {
  return (
    <div className="particle-background">
      <div className="floating-particles" />
      <div className="nebula-glow" />
    </div>
  );
}