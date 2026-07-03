import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const triggerClass =
  'contact-form-field contact-form-select-trigger w-full min-h-[3rem] h-auto rounded-lg border border-white/20 bg-[#0a0a0a] px-3 py-3.5 text-sm text-white lg:px-4 lg:py-4 lg:text-base data-[placeholder]:text-white/40 focus:border-[#c9a227]/50 focus:ring-1 focus:ring-[#c9a227]/25'

const contentClass =
  'contact-form-select-content z-[200] max-h-72 border border-white/20 bg-[#0a0a0a] text-white shadow-lg'

const itemClass =
  'text-white focus:bg-[#c9a227]/15 focus:text-white data-[highlighted]:bg-[#c9a227]/15 data-[highlighted]:text-white'

/**
 * Dark-themed dropdown for Talk to Us contact forms (Radix Select).
 */
export function ContactFormSelect({
  id,
  name,
  value,
  options,
  placeholder = 'Select…',
  required = false,
  disabled = false,
  onChange,
}) {
  const current = value || ''

  return (
    <>
      {/* Keeps field in form state for submit composition */}
      <input type="hidden" name={name} value={current} tabIndex={-1} aria-hidden />
      <Select
        value={current || undefined}
        onValueChange={(v) => onChange(name, v)}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={triggerClass} aria-required={required}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClass} position="popper">
          {options.map((option) => (
            <SelectItem key={option} value={option} className={itemClass}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
