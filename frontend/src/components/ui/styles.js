import clsx from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export const uiFocusRingClass =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]';

export const uiInteractiveClass =
  'transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out';

export const uiSurfaceClass =
  'border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,252,247,0.92),rgba(251,246,238,0.82))] shadow-[0_24px_60px_rgba(18,12,7,0.08),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(20,16,12,0.92),rgba(12,10,8,0.84))]';

export const uiSurfaceStrongClass = 'card-elevated';

export const uiMutedSurfaceClass =
  'border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,251,245,0.82),rgba(250,245,236,0.68))] shadow-[0_12px_28px_rgba(18,12,7,0.05)] backdrop-blur dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.82),rgba(12,10,8,0.7))]';

export const uiLabelClass =
  'text-[0.8rem] font-semibold tracking-[-0.01em] text-slate-700 dark:text-slate-200';

export const uiLabelHintClass =
  'text-xs font-medium text-slate-500 dark:text-slate-400';

export const uiHelpClass = 'text-xs text-slate-500 dark:text-slate-400';

export const uiErrorClass = 'text-xs font-medium text-rose-500';

export const uiFieldWrapperClass = 'block space-y-1.5';

export const uiFieldClass = cn(
  'w-full rounded-[22px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(250,247,241,0.86))] text-slate-900 shadow-[0_12px_28px_rgba(18,12,7,0.04),inset_0_1px_0_rgba(255,255,255,0.72)] outline-none placeholder:text-stone-400 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.9),rgba(12,10,8,0.82))] dark:text-slate-100 dark:placeholder:text-stone-500',
  uiInteractiveClass,
  'focus:border-amber-300 focus:ring-2 focus:ring-amber-400/55'
);

export const uiFieldShellClass = cn(
  'flex items-center gap-3 rounded-[22px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(250,247,241,0.86))] text-slate-900 shadow-[0_12px_28px_rgba(18,12,7,0.04),inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.9),rgba(12,10,8,0.82))] dark:text-slate-100',
  uiInteractiveClass,
  'focus-within:border-amber-300 focus-within:ring-2 focus-within:ring-amber-400/55'
);

export const uiFieldInputClass =
  'min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500';

export const uiSelectClass = cn(uiFieldClass, 'appearance-none pr-10');

export const fieldSizeClasses = {
  sm: 'px-3.5 py-2.5 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-3.5 text-base',
};

export const fieldShellSizeClasses = {
  sm: 'px-3.5 py-2.5',
  md: 'px-4 py-3',
  lg: 'px-5 py-3.5',
};

export const buttonVariantClasses = {
  primary:
    'bg-[linear-gradient(135deg,#7c5829,#d6b57e_58%,#f2e0bb)] text-[#120d08] shadow-[0_14px_32px_rgba(143,107,51,0.24)] hover:shadow-[0_18px_38px_rgba(143,107,51,0.32)]',
  secondary:
    'border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(251,246,238,0.86))] text-slate-800 shadow-[0_12px_28px_rgba(18,12,7,0.05),inset_0_1px_0_rgba(255,255,255,0.72)] hover:border-amber-300/80 hover:bg-white hover:shadow-[0_16px_32px_rgba(18,12,7,0.08)] dark:border-amber-300/15 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.9),rgba(12,10,8,0.84))] dark:text-slate-100 dark:hover:border-amber-300/30 dark:hover:bg-[#18130f]',
  outline:
    'border border-amber-300/80 bg-transparent text-slate-800 hover:border-amber-400/80 hover:bg-amber-50/70 hover:shadow-[0_10px_24px_rgba(143,107,51,0.08)] dark:border-amber-300/35 dark:text-slate-100 dark:hover:border-amber-300/50 dark:hover:bg-[#18130f]',
  ghost:
    'bg-transparent text-slate-700 hover:bg-amber-50/80 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-[#18130f] dark:hover:text-white',
  soft:
    'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-400/12 dark:text-amber-200 dark:hover:bg-amber-400/18',
  danger:
    'bg-[linear-gradient(135deg,#e11d48,#f43f5e)] text-white shadow-[0_12px_28px_rgba(225,29,72,0.2)] hover:shadow-[0_16px_32px_rgba(225,29,72,0.26)]',
};

export const buttonSizeClasses = {
  xs: 'px-3 py-2 text-xs',
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  xl: 'px-6 py-3.5 text-base',
  icon: 'h-10 w-10 p-0',
};

export const cardVariantClasses = {
  default: 'card-surface',
  elevated: 'card-elevated',
  blog:
    'card-surface border border-white/60 bg-white/90 shadow-[0_22px_55px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-950/78',
  dashboard:
    'border border-amber-100/70 bg-[radial-gradient(circle_at_top_left,rgba(214,181,126,0.14),transparent_32%),linear-gradient(180deg,rgba(255,252,247,0.94),rgba(249,243,233,0.84))] shadow-[0_26px_70px_rgba(18,12,7,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl dark:border-amber-300/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(210,178,122,0.14),transparent_34%),linear-gradient(180deg,rgba(20,16,12,0.94),rgba(12,10,8,0.84))]',
  muted:
    'border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/50',
  outline:
    'border border-slate-200/80 bg-transparent shadow-none dark:border-slate-800 dark:bg-transparent',
};

export const cardPaddingClasses = {
  none: '',
  sm: 'p-4 sm:p-5',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-7 sm:p-9',
};

export const badgeVariantClasses = {
  default:
    'border border-slate-200/80 bg-white/80 text-slate-600 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-300',
  brand:
    'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
  muted:
    'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
  success:
    'bg-lime-100 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger:
    'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  outline:
    'border border-slate-300/90 bg-transparent text-slate-600 dark:border-slate-600/80 dark:text-slate-300',
};

export const badgeSizeClasses = {
  sm: 'px-2.5 py-1 text-[10px]',
  md: 'px-3 py-1.5 text-[11px]',
  lg: 'px-3.5 py-2 text-xs',
};

export const modalSizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
  full: 'max-w-6xl',
};

export const dropdownWidthClasses = {
  sm: 'w-48',
  md: 'w-56',
  lg: 'w-72',
  xl: 'w-80',
};

export const dropdownAlignClasses = {
  left: 'left-0 origin-top-left',
  right: 'right-0 origin-top-right',
};

export const dropdownTriggerClass = cn(
  'inline-flex items-center justify-center gap-2 rounded-full border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(251,246,238,0.86))] px-4 py-2.5 text-sm font-medium text-slate-700 shadow-[0_12px_28px_rgba(18,12,7,0.06)] backdrop-blur dark:border-amber-300/15 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.9),rgba(12,10,8,0.82))] dark:text-slate-100',
  uiInteractiveClass,
  uiFocusRingClass,
  'hover:bg-white hover:shadow-[0_16px_34px_rgba(18,12,7,0.08)] dark:hover:bg-[#18130f]'
);

export const dropdownMenuClass =
  'absolute z-50 mt-3 overflow-hidden rounded-[28px] border border-amber-100/80 bg-[linear-gradient(180deg,rgba(255,252,247,0.96),rgba(249,243,233,0.92))] p-2 shadow-[0_28px_72px_rgba(18,12,7,0.16)] backdrop-blur-xl focus:outline-none dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(18,14,11,0.96),rgba(10,8,6,0.94))]';
