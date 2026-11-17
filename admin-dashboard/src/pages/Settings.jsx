import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Bell, Building2, CalendarClock, Check, RotateCcw, Save, Settings2, SlidersHorizontal, X } from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import { settingSections, settingWorkingDays, settingsDefaults } from '../data/settingsDefaults.js'
import { getAdminSettings, saveAdminSettings } from '../services/adminFirestoreService.js'

const cloneSettings = (settings) => ({ ...settings, workingDays: [...settings.workingDays] })
const phonePattern = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidIndianPhone(value) {
  return phonePattern.test(String(value || '').replace(/[\s()-]/g, ''))
}

const sectionIcons = {
  general: Building2,
  contact: Bell,
  booking: CalendarClock,
  pricing: SlidersHorizontal,
  notifications: Bell,
  display: Settings2,
}

function SettingField({ label, name, value, onChange, error, help, type = 'text', required, min, max, step, placeholder, inputMode }) {
  const errorId = `settings-error-${name}`
  return <label className="settings-field">
    <span className="settings-field-label">{label}{required && <b aria-hidden="true"> *</b>}</span>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      inputMode={inputMode}
      aria-invalid={Boolean(error)}
      aria-describedby={`${help ? `${name}-help ` : ''}${error ? errorId : ''}`.trim() || undefined}
    />
    {help && <small id={`${name}-help`} className="settings-field-help">{help}</small>}
    {error && <small id={errorId} className="settings-field-error">{error}</small>}
  </label>
}

function SettingTextarea({ label, name, value, onChange, help, maxLength }) {
  return <label className="settings-field settings-field-wide">
    <span className="settings-field-label">{label}</span>
    <textarea name={name} value={value} onChange={onChange} rows="3" maxLength={maxLength} />
    {help && <small className="settings-field-help">{help}</small>}
  </label>
}

function ToggleRow({ title, description, name, checked, onChange }) {
  return <label className="settings-toggle-row">
    <span><strong>{title}</strong><small>{description}</small></span>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} aria-label={title} />
  </label>
}

function SectionPanel({ title, description, children, className = '' }) {
  return <section className={`panel settings-section-panel ${className}`}>
    <div className="settings-section-heading"><h2>{title}</h2><p>{description}</p></div>
    {children}
  </section>
}

export default function Settings() {
  const [savedSettings, setSavedSettings] = useState(() => cloneSettings(settingsDefaults))
  const [draft, setDraft] = useState(() => cloneSettings(settingsDefaults))
  const [activeSection, setActiveSection] = useState('general')
  const [errors, setErrors] = useState({})
  const [confirmation, setConfirmation] = useState(null)
  const [toast, setToast] = useState(null)
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedSettings), [draft, savedSettings])

  // Load business settings from Firestore
  useEffect(() => {
    getAdminSettings().then((firestoreSettings) => {
      if (firestoreSettings) {
        const merged = { ...settingsDefaults, ...firestoreSettings }
        setSavedSettings(cloneSettings(merged))
        setDraft(cloneSettings(merged))
      }
    }).catch((err) => console.warn('Could not load settings from Firestore:', err))
  }, [])

  useEffect(() => {
    if (!confirmation) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setConfirmation(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [confirmation])

  const notify = (message, tone = 'success') => {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), 4000)
  }

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setDraft((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const toggleWorkingDay = (day) => {
    setDraft((current) => ({
      ...current,
      workingDays: current.workingDays.includes(day)
        ? current.workingDays.filter((item) => item !== day)
        : settingWorkingDays.filter((item) => [...current.workingDays, day].includes(item)),
    }))
  }

  const validate = () => {
    const nextErrors = {}
    const requiredText = [
      ['businessName', 'Enter the business name.'],
      ['businessPhone', 'Enter the business phone number.'],
      ['businessEmail', 'Enter the business email address.'],
      ['businessAddress', 'Enter the business address.'],
      ['city', 'Enter the city.'],
      ['state', 'Enter the state.'],
      ['postalCode', 'Enter the postal code.'],
      ['primaryContact', 'Enter the primary contact number.'],
      ['supportEmail', 'Enter the support email address.'],
      ['businessHours', 'Enter business hours.'],
      ['bookingPrefix', 'Enter a booking ID prefix.'],
    ]
    requiredText.forEach(([key, message]) => {
      if (!String(draft[key] ?? '').trim()) nextErrors[key] = message
    })
    for (const [key, label] of [
      ['businessPhone', 'Business phone'], ['primaryContact', 'Primary contact'],
      ['alternateContact', 'Alternate contact'], ['whatsappNumber', 'WhatsApp number'],
    ]) {
      const value = String(draft[key] || '').trim()
      if (value && !isValidIndianPhone(value)) nextErrors[key] = `${label} must be a valid Indian mobile number.`
    }
    for (const [key, label] of [['businessEmail', 'Business email'], ['supportEmail', 'Support email']]) {
      const value = String(draft[key] || '').trim()
      if (value && !emailPattern.test(value)) nextErrors[key] = `Enter a valid ${label.toLowerCase()} address.`
    }
    if (draft.postalCode && !/^\d{6}$/.test(String(draft.postalCode))) nextErrors.postalCode = 'Postal code must contain 6 digits.'
    if (draft.bookingPrefix && !/^[A-Za-z0-9_-]{2,8}$/.test(String(draft.bookingPrefix).trim())) nextErrors.bookingPrefix = 'Use 2–8 letters, numbers, hyphens or underscores.'
    if (!draft.workingDays.length) nextErrors.workingDays = 'Select at least one working day.'

    const numericRules = [
      ['minimumAdvanceMinutes', 'Minimum advance booking time', 0, true, false],
      ['maximumAdvanceDays', 'Maximum advance booking period', 1, true, true],
      ['passengerLimit', 'Passenger limit', 1, true, true],
      ['luggageLimit', 'Luggage limit', 0, true, false],
      ['minimumFare', 'Default minimum fare', 0, false, false],
      ['perKilometreRate', 'Default per-kilometre rate', 0, false, false],
      ['driverAllowance', 'Default driver allowance', 0, true, false],
      ['waitingCharge', 'Default waiting charge', 0, true, false],
      ['nightCharge', 'Default night charge', 0, true, false],
    ]
    numericRules.forEach(([key, label, min, integer, strictlyPositive]) => {
      const value = draft[key]
      const amount = Number(value)
      if (value === '' || !Number.isFinite(amount) || (integer && !Number.isInteger(amount)) || amount < min || (strictlyPositive && amount <= 0)) {
        nextErrors[key] = `${label} must be a ${strictlyPositive ? 'positive' : 'valid non-negative'}${integer ? ' whole number' : ' amount'}.`
      }
    })
    return nextErrors
  }

  const saveChanges = (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      notify('Please correct the highlighted fields before saving.', 'error')
      return
    }
    const normalized = {
      ...draft,
      businessName: draft.businessName.trim(),
      businessPhone: draft.businessPhone.trim(),
      businessEmail: draft.businessEmail.trim(),
      businessAddress: draft.businessAddress.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      postalCode: String(draft.postalCode).trim(),
      primaryContact: draft.primaryContact.trim(),
      alternateContact: draft.alternateContact.trim(),
      supportEmail: draft.supportEmail.trim(),
      whatsappNumber: draft.whatsappNumber.trim(),
      bookingPrefix: draft.bookingPrefix.trim().toUpperCase(),
      minimumAdvanceMinutes: Number(draft.minimumAdvanceMinutes),
      maximumAdvanceDays: Number(draft.maximumAdvanceDays),
      passengerLimit: Number(draft.passengerLimit),
      luggageLimit: Number(draft.luggageLimit),
      minimumFare: Number(draft.minimumFare),
      perKilometreRate: Number(draft.perKilometreRate),
      driverAllowance: Number(draft.driverAllowance),
      waitingCharge: Number(draft.waitingCharge),
      nightCharge: Number(draft.nightCharge),
      tablePageSize: Number(draft.tablePageSize),
    }
    setSavedSettings(cloneSettings(normalized))
    setDraft(cloneSettings(normalized))
    setErrors({})
    saveAdminSettings(normalized)
      .then(() => notify('Settings saved to Firestore successfully.'))
      .catch((err) => {
        console.warn('Error saving settings to Firestore:', err)
        notify('Settings saved for this session (Firestore offline).', 'amber')
      })
  }

  const discardChanges = () => {
    setDraft(cloneSettings(savedSettings))
    setErrors({})
    setConfirmation(null)
    notify('Unsaved changes were discarded.')
  }

  const resetDefaults = () => {
    setDraft(cloneSettings(settingsDefaults))
    setSavedSettings(cloneSettings(settingsDefaults))
    setErrors({})
    setConfirmation(null)
    notify('Demo defaults restored for this app session.')
  }

  const changeSection = (section) => {
    setActiveSection(section)
  }

  const currentSection = settingSections.find((section) => section.id === activeSection) || settingSections[0]
  const CurrentIcon = sectionIcons[activeSection] || Settings2

  return <>
    <PageHeader title="Settings" description="Manage local demo preferences for the Kolhapur Cab Service admin workspace.">
      <div className="settings-header-actions">
        <button type="button" className="secondary-button" onClick={() => setConfirmation({ type: 'reset' })}><RotateCcw size={14} />Reset defaults</button>
        <button type="button" className="secondary-button" disabled={!isDirty} onClick={() => setConfirmation({ type: 'discard' })}><RotateCcw size={14} />Discard changes</button>
        <button type="button" className="primary-button" onClick={saveChanges}><Save size={14} />Save changes</button>
      </div>
    </PageHeader>
    <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Local demo settings</strong> — changes apply only to this page session and are not sent to a server or saved to a database.</span></div>
    {toast && <div className={`settings-toast settings-toast-${toast.tone}`} role={toast.tone === 'error' ? 'alert' : 'status'}><span>{toast.tone === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}</span>{toast.message}</div>}

    <div className="settings-layout">
      <nav className="panel settings-navigation" aria-label="Settings sections">
        <p className="settings-navigation-label">SETTINGS</p>
        {settingSections.map((section) => {
          const Icon = sectionIcons[section.id]
          return <button key={section.id} type="button" className={`settings-navigation-item${activeSection === section.id ? ' settings-navigation-active' : ''}`} aria-current={activeSection === section.id ? 'page' : undefined} onClick={() => changeSection(section.id)}>
            <Icon size={16} /><span>{section.label}</span>
          </button>
        })}
        <div className={`settings-dirty-indicator${isDirty ? ' is-dirty' : ''}`}><i />{isDirty ? 'Unsaved changes' : 'All changes saved'}</div>
      </nav>

      <form className="settings-content" onSubmit={saveChanges} noValidate>
        <SectionPanel title={currentSection.label} description={`Configure ${currentSection.label.toLowerCase()} preferences. Changes are kept while you move between sections.`}>
          <div className="settings-section-icon"><CurrentIcon size={17} /><span>{currentSection.label}</span></div>
          {activeSection === 'general' && <div className="settings-fields-grid">
            <SettingField label="Business name" name="businessName" value={draft.businessName} onChange={updateField} error={errors.businessName} required />
            <SettingField label="Business phone number" name="businessPhone" value={draft.businessPhone} onChange={updateField} error={errors.businessPhone} required help="Use a valid Indian mobile number." />
            <SettingField label="Business email" name="businessEmail" type="email" value={draft.businessEmail} onChange={updateField} error={errors.businessEmail} required />
            <SettingField label="Business address" name="businessAddress" value={draft.businessAddress} onChange={updateField} error={errors.businessAddress} required />
            <SettingField label="City" name="city" value={draft.city} onChange={updateField} error={errors.city} required />
            <SettingField label="State" name="state" value={draft.state} onChange={updateField} error={errors.state} required />
            <SettingField label="Postal code" name="postalCode" value={draft.postalCode} onChange={updateField} error={errors.postalCode} required inputMode="numeric" />
            <SettingTextarea label="Business description" name="businessDescription" value={draft.businessDescription} onChange={updateField} help="Short internal description for this demo workspace." maxLength={300} />
          </div>}

          {activeSection === 'contact' && <div className="settings-fields-grid">
            <SettingField label="Primary contact number" name="primaryContact" value={draft.primaryContact} onChange={updateField} error={errors.primaryContact} required />
            <SettingField label="Alternate contact number (optional)" name="alternateContact" value={draft.alternateContact} onChange={updateField} error={errors.alternateContact} />
            <SettingField label="Support email" name="supportEmail" type="email" value={draft.supportEmail} onChange={updateField} error={errors.supportEmail} required />
            <SettingField label="WhatsApp contact number" name="whatsappNumber" value={draft.whatsappNumber} onChange={updateField} error={errors.whatsappNumber} help="Optional Indian mobile number for demo display." />
            <SettingField label="Business hours" name="businessHours" value={draft.businessHours} onChange={updateField} error={errors.businessHours} required help="Use local time, for example 08:00–22:00." />
            <fieldset className="settings-days-field settings-field-wide">
              <legend>Working days</legend>
              <div className="settings-days-list">{settingWorkingDays.map((day) => <label key={day} className="settings-day-option"><input type="checkbox" checked={draft.workingDays.includes(day)} onChange={() => toggleWorkingDay(day)} />{day}</label>)}</div>
              {errors.workingDays && <small className="settings-field-error">{errors.workingDays}</small>}
            </fieldset>
          </div>}

          {activeSection === 'booking' && <div className="settings-fields-grid">
            <SettingField label="Booking ID prefix" name="bookingPrefix" value={draft.bookingPrefix} onChange={updateField} error={errors.bookingPrefix} required help="2–8 characters; saved in uppercase." />
            <SettingField label="Minimum advance booking time (minutes)" name="minimumAdvanceMinutes" type="number" value={draft.minimumAdvanceMinutes} onChange={updateField} error={errors.minimumAdvanceMinutes} min="0" step="1" required />
            <SettingField label="Maximum advance booking period (days)" name="maximumAdvanceDays" type="number" value={draft.maximumAdvanceDays} onChange={updateField} error={errors.maximumAdvanceDays} min="1" step="1" required />
            <SettingField label="Default passenger limit" name="passengerLimit" type="number" value={draft.passengerLimit} onChange={updateField} error={errors.passengerLimit} min="1" step="1" required />
            <SettingField label="Default luggage limit" name="luggageLimit" type="number" value={draft.luggageLimit} onChange={updateField} error={errors.luggageLimit} min="0" step="1" required />
            <div className="settings-toggles-stack settings-field-wide">
              <ToggleRow title="Allow same-day bookings" description="Local preference only; no booking system is connected." name="allowSameDay" checked={draft.allowSameDay} onChange={updateField} />
              <ToggleRow title="Allow return bookings" description="Local preference only; no booking system is connected." name="allowReturnBookings" checked={draft.allowReturnBookings} onChange={updateField} />
            </div>
          </div>}

          {activeSection === 'pricing' && <>
            <div className="settings-pricing-notice"><AlertCircle size={15} /><span>Default/demo values only. These settings are not connected to a live fare calculator or payment system.</span></div>
            <div className="settings-fields-grid">
              <SettingField label="Default minimum fare (₹)" name="minimumFare" type="number" value={draft.minimumFare} onChange={updateField} error={errors.minimumFare} min="0" step="0.01" required />
              <SettingField label="Default per-kilometre rate (₹)" name="perKilometreRate" type="number" value={draft.perKilometreRate} onChange={updateField} error={errors.perKilometreRate} min="0" step="0.01" required />
              <SettingField label="Default driver allowance (₹)" name="driverAllowance" type="number" value={draft.driverAllowance} onChange={updateField} error={errors.driverAllowance} min="0" step="0.01" required />
              <SettingField label="Default waiting charge (₹)" name="waitingCharge" type="number" value={draft.waitingCharge} onChange={updateField} error={errors.waitingCharge} min="0" step="0.01" required />
              <SettingField label="Default night charge (₹)" name="nightCharge" type="number" value={draft.nightCharge} onChange={updateField} error={errors.nightCharge} min="0" step="0.01" required />
            </div>
          </>}

          {activeSection === 'notifications' && <div className="settings-notification-list">
            <ToggleRow title="New booking notification" description="Show a local preference for new demo bookings." name="notifyBookings" checked={draft.notifyBookings} onChange={updateField} />
            <ToggleRow title="New enquiry notification" description="Show a local preference for new demo enquiries." name="notifyEnquiries" checked={draft.notifyEnquiries} onChange={updateField} />
            <ToggleRow title="Callback request notification" description="Show a local preference for callback requests." name="notifyCallbacks" checked={draft.notifyCallbacks} onChange={updateField} />
            <ToggleRow title="Review notification" description="Show a local preference for new demo reviews." name="notifyReviews" checked={draft.notifyReviews} onChange={updateField} />
            <ToggleRow title="Offer-related notification" description="Show a local preference for demo offer changes." name="notifyOffers" checked={draft.notifyOffers} onChange={updateField} />
            <p className="settings-inline-note">These checkboxes only update local settings state. They do not send or receive notifications.</p>
          </div>}

          {activeSection === 'display' && <div className="settings-fields-grid">
            <label className="settings-field">
              <span className="settings-field-label">Default table page size</span>
              <select name="tablePageSize" value={draft.tablePageSize} onChange={updateField}>
                {[10, 20, 50].map((size) => <option key={size} value={size}>{size} rows</option>)}
              </select>
              <small className="settings-field-help">A local preference for table display defaults.</small>
            </label>
            <label className="settings-field">
              <span className="settings-field-label">Date display preference</span>
              <select name="dateFormat" value={draft.dateFormat} onChange={updateField}>
                <option>DD MMM YYYY</option>
                <option>MMM DD, YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
              <small className="settings-field-help">Preview: {draft.dateFormat === 'YYYY-MM-DD'
                ? '2026-11-17'
                : new Intl.DateTimeFormat(draft.dateFormat === 'MMM DD, YYYY' ? 'en-US' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(2026, 10, 17))}</small>
            </label>
            <div className="settings-theme-note settings-field-wide"><strong>Appearance</strong><span>The admin workspace currently uses its existing light theme. No separate theme system is enabled here.</span></div>
          </div>}
        </SectionPanel>

        <div className="settings-footer-actions">
          <span className={isDirty ? 'settings-footer-dirty' : 'settings-footer-clean'}>{isDirty ? 'You have unsaved changes.' : 'No unsaved changes.'}</span>
          <div><button type="button" className="secondary-button" disabled={!isDirty} onClick={() => setConfirmation({ type: 'discard' })}><RotateCcw size={14} />Discard</button><button type="submit" className="primary-button"><Save size={14} />Save changes</button></div>
        </div>
      </form>
    </div>

    {confirmation && <div className="modal-backdrop" role="presentation" onClick={() => setConfirmation(null)}>
      <section className="settings-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="settings-confirm-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><span className="eyebrow">{confirmation.type === 'reset' ? 'RESTORE DEMO SETTINGS' : 'DISCARD EDITS'}</span><h2 id="settings-confirm-title">{confirmation.type === 'reset' ? 'Restore default settings?' : 'Discard unsaved changes?'}</h2></div><button className="icon-button" type="button" aria-label="Close confirmation" onClick={() => setConfirmation(null)}><X size={18} /></button></div>
        <p>{confirmation.type === 'reset' ? 'All sections will return to the original local demo defaults for this session.' : 'Your current edits will be replaced by the last saved local settings.'}</p>
        <div className="settings-confirm-actions">
          <button type="button" className="secondary-button" onClick={() => setConfirmation(null)}>Keep editing</button>
          {confirmation.type === 'reset'
            ? <button type="button" className="primary-button" onClick={resetDefaults}>Restore defaults</button>
            : <button type="button" className="primary-button destructive-confirm-button" onClick={discardChanges}>Discard changes</button>}
        </div>
      </section>
    </div>}
  </>
}
