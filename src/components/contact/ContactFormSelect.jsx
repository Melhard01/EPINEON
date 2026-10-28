import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const triggerClass =
  'contact-form-field contact-form-select-trigger contact-input contact-input--select h-auto'

const contentClass =
  'contact-form-select-content z-[200] max-h-72 rounded-xl border border-white/15 bg-[#121212]/85 text-white backdrop-blur-xl backdrop-saturate-150 shadow-[0_24px_56px_-18px_rgba(0,0,0,0.9)]'

const itemClass =
  'rounded-lg text-white focus:bg-[#c9a227]/15 focus:text-white data-[highlighted]:bg-[#c9a227]/15 data-[highlighted]:text-white'

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
