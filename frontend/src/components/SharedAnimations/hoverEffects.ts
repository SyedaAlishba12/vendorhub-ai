/**
 * hoverEffects.ts — Shared Tailwind className constants for consistent hover behaviour.
 * Usage: import { cardHover } from '@/components/SharedAnimations';
 *        <div className={`bg-white ${cardHover}`}>…</div>
 */

/** Elevates a card with a deeper shadow on hover. */
export const cardHover =
  'transition-shadow duration-200 hover:shadow-lg cursor-pointer';

/** Lifts an element slightly upward and adds a shadow on hover. */
export const liftHover =
  'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer';

/** Scales an element up subtly on hover — good for images or icon tiles. */
export const scaleHover =
  'transition-transform duration-200 hover:scale-105 cursor-pointer';

/** Dims an element on hover — useful for links, secondary actions. */
export const fadedHover =
  'transition-opacity duration-150 hover:opacity-70 cursor-pointer';

/** Highlights with a colored border ring on hover — good for selectable items. */
export const ringHover =
  'transition-all duration-150 hover:ring-2 hover:ring-indigo-400 hover:ring-offset-1 cursor-pointer';

/** Applies a subtle background tint on hover — best for list rows or menu items. */
export const rowHover =
  'transition-colors duration-150 hover:bg-slate-50 cursor-pointer';

/** Gives interactive buttons a slight colour-shift + shadow on hover. */
export const buttonHover =
  'transition-all duration-150 hover:brightness-105 hover:shadow-md active:scale-95 cursor-pointer';
