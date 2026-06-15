import React, { useEffect, useRef, useState } from 'react';

interface WaterRippleCanvasProps {
  rippleTrigger: { x: number; y: number; timestamp: number } | null;
  onHalfway: () => void;
  onComplete: () => void;
}

interface WaveRing {
  cx: number;
  cy: number;
  radius: number;
  speed: number;
  maxRadius: number;
  alpha: number;
  color: string;
  lineWidth: number;
}

interface SplashingDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface MiniRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export default function WaterRippleCanvas({
  rippleTrigger,
  onHalfway,
  onComplete,
}: WaterRippleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!rippleTrigger) return;

    setActive(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas dimensions
    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Coordinate variables
    const cx = rippleTrigger.x;
    const cy = rippleTrigger.y;

    // Calculate maximum radius to cleanly cover any corner
    const dxMax = Math.max(cx, width - cx);
    const dyMax = Math.max(cy, height - cy);
    const maxRadius = Math.sqrt(dxMax * dxMax + dyMax * dyMax) * 1.15;

    // Wave ring definitions (concentric ripples)
    const waveRings: WaveRing[] = [
      { cx, cy, radius: 10, speed: 7.5, maxRadius, alpha: 1.0, color: 'rgba(79, 37, 70,', lineWidth: 4.5 },
      { cx, cy, radius: 5, speed: 6.0, maxRadius: maxRadius * 0.9, alpha: 0.8, color: 'rgba(244, 174, 82,', lineWidth: 3.5 },
      { cx, cy, radius: 0, speed: 5.0, maxRadius: maxRadius * 0.75, alpha: 0.6, color: 'rgba(255, 247, 197,', lineWidth: 2.0 },
      { cx, cy, radius: 0, speed: 4.2, maxRadius: maxRadius * 0.6, alpha: 0.45, color: 'rgba(79, 37, 70,', lineWidth: 1.5 },
    ];

    // Splashing Droplets from center contact
    const droplets: SplashingDroplet[] = [];
    const numDroplets = 16 + Math.floor(Math.random() * 8);
    for (let i = 0; i < numDroplets; i++) {
      const angle = Math.random() * Math.PI * 2;
      const force = 3.5 + Math.random() * 8.5;
      droplets.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force - (1.5 + Math.random() * 2), // slightly up bias/float
        gravity: 0.18 + Math.random() * 0.1,
        life: 0,
        maxLife: 25 + Math.floor(Math.random() * 25),
        size: 2.5 + Math.random() * 3,
        color: i % 3 === 0 ? '#F4AE52' : i % 3 === 1 ? '#FFF7C5' : '#4F252E',
      });
    }

    const miniRipples: MiniRipple[] = [];

    // State counters
    let progress = 0; // 0 to 1
    const totalDuration = 90; // frames (~1.5s at 60fps)
    let calledHalfway = false;

    // Easing equations
    const cubicOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const sineInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

    const animate = () => {
      progress += 1 / totalDuration;
      if (progress > 1) progress = 1;

      // Clear layout
      ctx.clearRect(0, 0, width, height);

      const time = Date.now() * 0.003;

      // ----------------------------------------------------
      // PART A: DUAL LAYER LIQUID WASH (FLUID COVER SHEET)
      // ----------------------------------------------------
      
      // 1. GOLD TRANSITION LAYER
      const goldProgress = Math.min(1, progress * 1.15);
      const goldEase = cubicOut(goldProgress);
      const currentRadiusGold = goldEase * maxRadius;

      if (goldProgress < 1) {
        ctx.fillStyle = '#F4AE52';
        ctx.beginPath();
        const numPoints = 120;
        for (let i = 0; i < numPoints; i++) {
          const theta = (i / numPoints) * Math.PI * 2;
          const wobble = Math.sin(theta * 6 + time * 5) * 22 * (1 - goldProgress) +
                        Math.cos(theta * 12 - time * 3) * 10 * (1 - goldProgress);
          const r = currentRadiusGold + wobble;
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }

      // 2. TEAL TRANSITION LAYER (FOLLOWS GOLD CLOSELY)
      const tealProgress = Math.max(0, (progress - 0.08) / 0.92);
      const tealEase = cubicOut(tealProgress);
      const currentRadiusTeal = tealEase * maxRadius;

      if (tealProgress < 1) {
        ctx.fillStyle = '#C1EBE9';
        ctx.beginPath();
        const numPoints = 120;
        for (let i = 0; i < numPoints; i++) {
          const theta = (i / numPoints) * Math.PI * 2;
          const wobble = Math.sin(theta * 5 - time * 4.5) * 18 * (1 - tealProgress) +
                        Math.cos(theta * 10 + time * 3.5) * 8 * (1 - tealProgress);
          const r = currentRadiusTeal + wobble;
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Keep screen covered entirely at the end
        ctx.fillStyle = '#C1EBE9';
        ctx.fillRect(0, 0, width, height);
      }

      // ----------------------------------------------------
      // PART B: CONCENTRIC SHIMMER WAVE FRONTS
      // ----------------------------------------------------
      waveRings.forEach((ring) => {
        ring.radius += ring.speed;
        const radiusPercent = ring.radius / ring.maxRadius;
        
        if (radiusPercent < 1.0) {
          const rAlpha = ring.alpha * (1 - radiusPercent) * (1 - progress);
          if (rAlpha > 0.01) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(ring.cx, ring.cy, ring.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `${ring.color}${rAlpha})`;
            ctx.lineWidth = ring.lineWidth * (1 - radiusPercent * 0.5);
            ctx.stroke();
            
            // Highlight shine shadow reflection effect
            ctx.beginPath();
            ctx.arc(ring.cx + 2, ring.cy + 2, Math.max(2, ring.radius - 3), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${rAlpha * 0.4})`;
            ctx.lineWidth = ring.lineWidth * 0.5;
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      // ----------------------------------------------------
      // PART C: GRAVITY WATER DROPLETS & SPLASHES
      // ----------------------------------------------------
      droplets.forEach((drop) => {
        if (drop.life < drop.maxLife) {
          // Adjust physical physics
          drop.x += drop.vx;
          drop.y += drop.vy;
          drop.vy += drop.gravity; // Gravity pull downs
          drop.life++;

          const dropProgress = drop.life / drop.maxLife;
          const size = drop.size * (1 - dropProgress);
          const alpha = 1.0 - dropProgress;

          // Draw floating droplet
          ctx.beginPath();
          ctx.arc(drop.x, drop.y, Math.max(0.5, size), 0, Math.PI * 2);
          ctx.fillStyle = drop.color;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(79, 37, 46, 0.2)';
          ctx.fill();
          ctx.shadowBlur = 0; // reset

          // Trace water vapor tail trail
          ctx.beginPath();
          ctx.moveTo(drop.x - drop.vx * 1.5, drop.y - drop.vy * 1.5);
          ctx.lineTo(drop.x, drop.y);
          ctx.strokeStyle = drop.color === '#4F252E' ? `rgba(79, 37, 46, ${alpha * 0.4})` : `rgba(255, 255, 255, ${alpha * 0.5})`;
          ctx.lineWidth = size * 0.7;
          ctx.stroke();

          // Spawn secondary mini-ripples when droplets land
          if (drop.life === drop.maxLife - 1 || (drop.y > ySurface(drop.x, height) && drop.life > 10)) {
            drop.life = drop.maxLife; // trigger end
            miniRipples.push({
              x: drop.x,
              y: drop.y,
              radius: 1,
              maxRadius: 25 + Math.random() * 30,
              alpha: 0.7,
              color: Math.random() > 0.5 ? 'rgba(244, 174, 82,' : 'rgba(79, 37, 46,',
            });
          }
        }
      });

      // ----------------------------------------------------
      // PART D: MINI-RIPPLES (SECONDARY CAPILLARY ACTIONS)
      // ----------------------------------------------------
      miniRipples.forEach((mini, index) => {
        mini.radius += 1.4;
        const mPercent = mini.radius / mini.maxRadius;
        if (mPercent < 1.0) {
          const mAlpha = mini.alpha * (1 - mPercent) * (1 - progress);
          if (mAlpha > 0.01) {
            ctx.beginPath();
            ctx.arc(mini.x, mini.y, mini.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `${mini.color}${mAlpha})`;
            ctx.lineWidth = 1.2 * (1 - mPercent);
            ctx.stroke();
          }
        } else {
          miniRipples.splice(index, 1);
        }
      });

      // ----------------------------------------------------
      // TRIGGER SWAP HALFWAY IN ANIMATION TIMELINE
      // ----------------------------------------------------
      // Trigger dashboard transition at 55% completion (looks perfectly seamless visually)
      if (progress >= 0.55 && !calledHalfway) {
        calledHalfway = true;
        onHalfway();
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Complete lifecycle
        onComplete();
        setActive(false);
        ctx.clearRect(0, 0, width, height);
      }
    };

    // Simulated local water line height boundary
    function ySurface(xVal: number, hVal: number): number {
      return hVal + 100; // prevent clipping, let drop fall longer
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [rippleTrigger]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-50 pointer-events-none"
      style={{ mixBlendMode: 'normal' }}
    />
  );
}
