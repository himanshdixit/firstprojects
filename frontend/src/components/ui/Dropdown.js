'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { Check, ChevronDown } from 'lucide-react';
import {
  dropdownAlignClasses,
  dropdownMenuClass,
  dropdownTriggerClass,
  dropdownWidthClasses,
} from './styles';

function DropdownItemBody({ item }) {
  const Icon = item.icon;

  return (
    <span className="flex min-w-0 items-start gap-3">
      {Icon ? (
        <span className="mt-0.5 shrink-0 text-current/75">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{item.label}</span>
        {item.description ? (
          <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
            {item.description}
          </span>
        ) : null}
      </span>
      {item.selected ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : null}
    </span>
  );
}

function DropdownMenuItem({ item, close }) {
  if (item.type === 'divider') {
    return <DropdownDivider />;
  }

  const itemClassName = clsx(
    'flex w-full items-center rounded-[20px] px-3 py-2.5 text-left text-sm transition duration-200',
    item.disabled && 'cursor-not-allowed opacity-50',
    item.variant === 'danger'
      ? 'text-rose-600 hover:bg-rose-50/90 dark:text-rose-300 dark:hover:bg-rose-950/30'
      : 'text-slate-700 hover:bg-amber-50/80 dark:text-slate-100 dark:hover:bg-[#18130f]'
  );

  return (
    <MenuItem disabled={item.disabled}>
      {({ focus }) => {
        const sharedClassName = clsx(
          itemClassName,
          focus &&
            (item.variant === 'danger'
              ? 'bg-rose-50 dark:bg-rose-950/30'
              : 'bg-amber-50/80 dark:bg-[#18130f]')
        );

        if (item.href) {
          return (
            <Link href={item.href} className={sharedClassName}>
              <DropdownItemBody item={item} />
            </Link>
          );
        }

        return (
          <button
            type="button"
            className={sharedClassName}
            onClick={() => {
              item.onClick?.();
              if (item.keepOpen !== true) {
                close();
              }
            }}
          >
            <DropdownItemBody item={item} />
          </button>
        );
      }}
    </MenuItem>
  );
}

export function DropdownDivider({ className = '' }) {
  return <div className={clsx('my-2 border-t border-amber-100/70 dark:border-amber-300/10', className)} />;
}

export default function Dropdown({
  trigger,
  label = 'Open menu',
  items = [],
  children,
  align = 'right',
  width = 'md',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  header,
  footer,
  showChevron = true,
}) {
  return (
    <Menu as="div" className={clsx('relative inline-block text-left', className)}>
      {({ close }) => (
        <>
          {trigger ? (
            <MenuButton as={Fragment}>{trigger}</MenuButton>
          ) : (
            <MenuButton className={clsx(dropdownTriggerClass, buttonClassName)}>
              <span>{label}</span>
              {showChevron ? <ChevronDown className="h-4 w-4 opacity-70" /> : null}
            </MenuButton>
          )}

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-2 scale-[0.97]"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-140"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-1 scale-[0.98]"
          >
            <MenuItems
              className={clsx(
                dropdownMenuClass,
                dropdownAlignClasses[align] || dropdownAlignClasses.right,
                dropdownWidthClasses[width] || dropdownWidthClasses.md,
                menuClassName
              )}
            >
              {header ? <div className="mb-1 rounded-[20px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(250,245,236,0.72))] px-3 py-3 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.84),rgba(12,10,8,0.72))]">{header}</div> : null}
              {items.map((item, index) => (
                <DropdownMenuItem
                  key={item.key || item.href || item.label || `dropdown-item-${index}`}
                  item={item}
                  close={close}
                />
              ))}
              {children}
              {footer ? (
                <>
                  <DropdownDivider />
                  <div className="rounded-[20px] border border-amber-100/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,245,236,0.7))] px-3 py-3 dark:border-amber-300/10 dark:bg-[linear-gradient(180deg,rgba(20,17,13,0.82),rgba(12,10,8,0.7))]">{footer}</div>
                </>
              ) : null}
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  );
}
