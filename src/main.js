// import Lenis
import Lenis from 'lenis'

// import gsap
import { gsap } from "gsap";
    
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import coordinates from '../constants/imageCoordinates.js';

document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Initialize a new Lenis instance for smooth scrolling
  const lenis = new Lenis();

  // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
  lenis.on('scroll', ScrollTrigger.update);

  // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
  // This ensures Lenis's smooth scroll animation updates on each GSAP tick
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000); // Convert time from seconds to milliseconds
  });

  // Disable lag smoothing in GSAP to prevent any delay in scroll animations
  gsap.ticker.lagSmoothing(0);

  initScrollAnimations();
  window.addEventListener('resize', initScrollAnimations);

  function initScrollAnimations() {
    const images = document.querySelectorAll('.img');
    const finalImg = document.querySelector('.final-img');
    const introHeader = document.querySelector('.intro-header h1');
    const outroHeader = document.querySelector('.outro-header h1');
    // const outerSection = document.querySelector('.outer-section h1');

    let introHeaderSplit = SplitText.create(introHeader, { type: "words" });
    gsap.set(introHeaderSplit.words, { opacity: 1 });

    let outroHeaderSplit = SplitText.create(outroHeader, { type: "words" });
    gsap.set(outroHeaderSplit.words, { opacity: 0 });
    gsap.set(outroHeader, { opacity: 1 });

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = screenWidth < 768;
    const coordinatesMultiplier = 0.5;

    const startPositions = Array.from(images).map(() => ({
      x: 0,
      y: window.innerHeight / 2,
      z: -1000,
      scale: 0,
    }));

    const endPositions = coordinates.map((coord) => ({
      x: coord.x * screenWidth / coordinatesMultiplier,
      y: coord.y * screenHeight / coordinatesMultiplier,
      z: 2000,
      scale: 1,
    }));

    images.forEach((img, index) => {
      gsap.set(img, startPositions[index]);
    });

    gsap.set(finalImg, {
      z: -1000,
      scale: 0,
      x: 0,
      y: 0,
    });

    ScrollTrigger.create({
      trigger: '.gallery-section',
      start: 'top top',
      end: `+=${images.length * 50}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        
        images.forEach((img, index) => {
          const staggerDelay = index * 0.02;
          const scaleMultiplier = isMobile ? 4 : 2;

          let imageProgress = Math.max(0, (progress - staggerDelay) * 4);

          const start = startPositions[index];
          const end = endPositions[index];

          const zValue = gsap.utils.interpolate(start.z, end.z, imageProgress);
          const scaleValue = gsap.utils.interpolate(start.scale, end.scale, imageProgress * scaleMultiplier);
          const xValue = gsap.utils.interpolate(start.x, end.x, imageProgress);
          const yValue = gsap.utils.interpolate(start.y, end.y, imageProgress);

          gsap.set(img, {
            x: xValue,
            y: yValue,
            z: zValue,
            scale: scaleValue,
          });
        });

        const finalImageProgress = Math.max(0, (progress - 0.7) * 4);
        const finalImageZValue = -1000 + (1000 * finalImageProgress);
        const finalImageScaleValue = Math.min(1, finalImageProgress * 2);

        gsap.set(finalImg, {
          z: finalImageZValue,
          scale: finalImageScaleValue,
          x: 0,
          y: 0,
        });

        if (introHeaderSplit && introHeaderSplit.words.length > 0) {
          if (progress >= 0.6 && progress <= 0.75) {
            const introFadeProgress = (progress - 0.6) / 0.15;
            const totalWords = introHeaderSplit.words.length;

            introHeaderSplit.words.forEach((word, i) => {
              const wordDelay = i / totalWords;
              const fadeRange = 0.1;

              if (introFadeProgress >= wordDelay + fadeRange) {
                gsap.to(word, { opacity: 0 });
              } else if (introFadeProgress <= wordDelay) {
                gsap.set(word, { opacity: 1 });
              } else {
                const wordOpacity = 1 - ((introFadeProgress - wordDelay) / fadeRange);
                gsap.to(word, { opacity: wordOpacity });
              }
            });
          } else if (progress < 0.6) {
            gsap.set(introHeaderSplit.words, { opacity: 1 });
          } else if (progress > 0.75) {
            gsap.set(introHeaderSplit.words, { opacity: 0 });
          }
        }

        if (outroHeaderSplit && outroHeaderSplit.words.length > 0) {
          if (progress >= 0.8 && progress <= 0.95) {
            const outroFadeProgress = (progress - 0.8) / 0.15;
            const totalWords = outroHeaderSplit.words.length;

            outroHeaderSplit.words.forEach((word, i) => {
              const wordDelay = i / totalWords;
              const fadeRange = 0.1;

              if (outroFadeProgress >= wordDelay + fadeRange) {
                gsap.set(word, { opacity: 1 });
              } else if (outroFadeProgress <= wordDelay) {
                gsap.set(word, { opacity: 0 });
              } else {
                const wordOpacity = ((outroFadeProgress - wordDelay) / fadeRange);
                gsap.set(word, { opacity: wordOpacity });
              }
            });
          } else if (progress < 0.8) {
            gsap.set(outroHeaderSplit.words, { opacity: 0 });
          } else if (progress > 0.95) {
            gsap.set(outroHeaderSplit.words, { opacity: 1 });
          }
        }
      }
    })
  }
});
