'use client';

import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import React from 'react';

export default function ParticlesBackground() {
  const getBubbleNumber = () => 80; // Fixed value for bubble number
  const getBubbleDistance = () => 200; // Fixed value for bubble distance
  const getBubbleRepulseDistance = () => 300; // Fixed value for repulsion distance
  return (
    <Particles
      id='tsparticles'
      init={loadFull}
      options={{
        fullScreen: false,
        background: {
          color: {
            value: 'transparent',
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onhover: {
              enable: true,
              mode: 'bubble',
            },
          },
          modes: {
            bubble: {
              distance: getBubbleDistance(),
              duration: 2,
              size: 0,
              opacity: 0,
            },
            repulse: {
              distance: getBubbleRepulseDistance(),
              duration: 4,
            },
          },
          retina_detect: true,
        },
        particles: {
          color: {
            value: '#000',
          },
          number: {
            value: getBubbleNumber(),
            density: {
              enable: false,
            },
          },
          size: {
            value: 2,
            random: true,
            anim: {
              speed: 4,
              size_min: 0.3,
            },
          },
          line_linked: {
            enable: false,
          },
          move: {
            enable: true,
            random: true,
            speed: 0.6,
            direction: 'top',
            out_mode: 'out',
          },
        },
        detectRetina: true,
      }}
      style={{
        position: 'absolute',
      }}
    />
  );
}
