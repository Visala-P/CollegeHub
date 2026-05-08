/**
 * Motion configuration for performance optimization
 * Uses GPU-accelerated transforms and reduces motion on mobile/low-power devices
 */

// Check if device is mobile or low-power
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isLowPowerMode = () => {
  if (typeof navigator === 'undefined') return false;
  // @ts-ignore - battery API not in all browsers
  return navigator.getBattery?.().then((battery: any) => battery.charging === false && battery.level < 0.2);
};

// Reduced animation durations for mobile
export const getAnimationDuration = (baseDuration: number) => {
  return isMobile() ? baseDuration * 0.7 : baseDuration;
};

// Common spring configurations
export const springs = {
  gentle: { type: "spring" as const, stiffness: 100, damping: 15 },
  responsive: { type: "spring" as const, stiffness: 300, damping: 25 },
  bouncy: { type: "spring" as const, stiffness: 400, damping: 17 },
};

// Common transition configurations
export const transitions = {
  fast: { duration: getAnimationDuration(0.2) },
  medium: { duration: getAnimationDuration(0.4) },
  slow: { duration: getAnimationDuration(0.8) },
};

// Hover animation variants (GPU-accelerated)
export const hoverScale = {
  scale: 1.05,
  transition: transitions.fast,
};

export const hoverLift = {
  y: -5,
  transition: transitions.fast,
};

// Entrance animations
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Stagger children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
