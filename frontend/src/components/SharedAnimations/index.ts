/**
 * SharedAnimations barrel export.
 * Usage: import { LoadingSpinner, SkeletonLoader, useToast, Modal, PageTransition, cardHover } from '@/components/SharedAnimations';
 */

// Components
export { LoadingSpinner } from './LoadingSpinner';
export type { LoadingSpinnerProps } from './LoadingSpinner';

export { SkeletonLoader } from './SkeletonLoader';
export type { SkeletonLoaderProps } from './SkeletonLoader';

export { ToastProvider, useToast } from './Toast';
export type { Toast, ToastType } from './Toast';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { PageTransition } from './PageTransition';
export type { PageTransitionProps } from './PageTransition';

export { ConfirmationDialog } from './ConfirmationDialog';
export type { ConfirmationDialogProps } from './ConfirmationDialog';

export { FadeIn } from './FadeIn';
export type { FadeInProps } from './FadeIn';

export { ScrollReveal } from './ScrollReveal';
export type { ScrollRevealProps } from './ScrollReveal';

export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';

// Hover effect constants
export {
  cardHover,
  liftHover,
  scaleHover,
  fadedHover,
  ringHover,
  rowHover,
  buttonHover,
} from './hoverEffects';