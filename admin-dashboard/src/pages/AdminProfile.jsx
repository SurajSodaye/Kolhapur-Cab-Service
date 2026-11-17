import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle, BriefcaseBusiness, Check, Clock3, Edit3, Globe2, Mail, MapPin, Phone,
  RotateCcw, Save, SlidersHorizontal, UserRound, X,
} from 'lucide-react'
import PageHeader from '../components/common/PageHeader.jsx'
import {
  profileCompletionFields, profileDateFormats, profileDefaults, profileLandingPages,
} from '../data/profileDefaults.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/
const cloneProfile = (profile) => ({ ...profile })

function getInitials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'AD'
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('')
}

function getCompletion(profile) {
  const completed = profileCompletionFields.filter((field) => String(profile[field] ?? '').trim()).length
  return Math.round((completed / profileCompletionFields.length) * 100)
}

function ProfileField({ label, name, value, onChange, error, required, type = 'text', help, wide = false }) {
  const errorId = `profile-error-${name}`
  return <label className={`profile-field${wide ? ' profile-field-wide' : ''}`}>
    <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      aria-invalid={Boolean(error)}
      aria-describedby={`${help ? `profile-help-${name} ` : ''}${error ? errorId : ''}`.trim() || undefined}
    />
    {help && <small id={`profile-help-${name}`}>{help}</small>}
    {error && <small id={errorId} className="profile-field-error">{error}</small>}
  </label>
}

function ProfileSelect({ label, name, value, onChange, options, help }) {
  return <label className="profile-field">
    <span>{label}</span>
    <select name={name} value={value} onChange={onChange}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    {help && <small>{help}</small>}
  </label>
}

function InfoItem({ icon: Icon, label, value }) {
  return <div className="profile-info-item">
    <span className="profile-info-icon"><Icon size={15} /></span>
    <span><small>{label}</small><strong>{value || 'Not provided'}</strong></span>
  </div>
}

export default function AdminProfile() {
  const [savedProfile, setSavedProfile] = useState(() => cloneProfile(profileDefaults))
  const [draft, setDraft] = useState(() => cloneProfile(profileDefaults))
  const [editing, setEditing] = useState(false)
  const [errors, setErrors] = useState({})
  const [confirmation, setConfirmation] = useState(null)
  const [toast, setToast] = useState(null)
  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedProfile), [draft, savedProfile])
  const completion = getCompletion(draft)
  const initials = getInitials(draft.fullName)

  useEffect(() => {
    if (!confirmation) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setConfirmation(null)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [confirmation])

  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const notify = (message, tone = 'success') => setToast({ message, tone })

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setDraft((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!String(draft.fullName || '').trim()) nextErrors.fullName = 'Enter your full name.'
    if (!String(draft.email || '').trim()) nextErrors.email = 'Enter your email address.'
    else if (!emailPattern.test(String(draft.email).trim())) nextErrors.email = 'Enter a valid email address.'
    if (!String(draft.phone || '').trim()) nextErrors.phone = 'Enter your contact number.'
    else if (!phonePattern.test(String(draft.phone).replace(/[\s()-]/g, ''))) {
      nextErrors.phone = 'Enter a valid Indian mobile number.'
    }
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
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    }
    setSavedProfile(cloneProfile(normalized))
    setDraft(cloneProfile(normalized))
    setErrors({})
    setEditing(false)
    notify('Demo profile saved for this app session.')
  }

  const discardChanges = () => {
    setDraft(cloneProfile(savedProfile))
    setErrors({})
    setEditing(false)
    setConfirmation(null)
    notify('Unsaved profile changes were discarded.')
  }

  const resetDefaults = () => {
    setSavedProfile(cloneProfile(profileDefaults))
    setDraft(cloneProfile(profileDefaults))
    setErrors({})
    setEditing(false)
    setConfirmation(null)
    notify('Demo profile defaults restored for this app session.')
  }

  const cancelEditing = () => {
    if (isDirty) setConfirmation({ type: 'discard' })
    else setEditing(false)
  }

  const saveButton = <button type="submit" form="admin-profile-form" className="primary-button"><Save size={14} />Save changes</button>

  return <>
    <PageHeader title="Admin Profile" description="Manage the fictional administrator profile and local display preferences.">
      <div className="profile-header-actions">
        <button type="button" className="secondary-button" onClick={() => setConfirmation({ type: 'reset' })}><RotateCcw size={14} />Reset demo profile</button>
        {!editing ? <button type="button" className="primary-button" onClick={() => { setEditing(true); setErrors({}) }}><Edit3 size={14} />Edit profile</button> : <>
          <button type="button" className="secondary-button" onClick={cancelEditing}><X size={14} />Cancel</button>
          {saveButton}
        </>}
      </div>
    </PageHeader>

    <div className="demo-banner"><span className="demo-banner-mark">i</span><span><strong>Fictional demo profile</strong> — changes stay in local React state for this page session. No account or authentication is connected.</span></div>
    {toast && <div className={`settings-toast ${toast.tone === 'error' ? 'settings-toast-error' : ''}`} role={toast.tone === 'error' ? 'alert' : 'status'}>
      <span>{toast.tone === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}</span>{toast.message}
    </div>}

    <section className="panel profile-overview" aria-label="Profile overview">
      <div className="profile-avatar" aria-label={`Avatar initials ${initials}`}>{initials}</div>
      <div className="profile-overview-copy">
        <div className="profile-name-row"><h2>{draft.fullName || 'Unnamed profile'}</h2><span className="profile-status"><i />Active demo</span></div>
        <p>Admin · {draft.jobTitle || 'Role not provided'}</p>
        <div className="profile-overview-contact"><span><Mail size={14} />{draft.email || 'Email not provided'}</span><span><Phone size={14} />{draft.phone || 'Phone not provided'}</span></div>
      </div>
      <div className="profile-completion">
        <div><span>Profile completion</span><strong>{completion}%</strong></div>
        <div className="profile-progress" role="progressbar" aria-label="Profile completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={completion}><i style={{ width: `${completion}%` }} /></div>
        <small>{profileCompletionFields.filter((field) => String(draft[field] ?? '').trim()).length} of {profileCompletionFields.length} profile details completed</small>
      </div>
    </section>

    <div className="profile-dirty-row">
      <span className={isDirty ? 'profile-dirty-indicator is-dirty' : 'profile-dirty-indicator'}><i />{isDirty ? 'Unsaved changes' : 'All changes saved'}</span>
      <span>{editing ? 'Edit mode · local demo only' : 'Read-only profile view'}</span>
    </div>

    <form id="admin-profile-form" className="profile-form" onSubmit={saveChanges} noValidate>
      <section className="panel profile-section">
        <div className="profile-section-heading"><span className="profile-section-icon"><UserRound size={17} /></span><div><h2>Personal information</h2><p>Basic details for this fictional demo administrator.</p></div></div>
        {editing ? <div className="profile-fields-grid">
          <ProfileField label="Full name" name="fullName" value={draft.fullName} onChange={updateField} error={errors.fullName} required />
          <ProfileField label="Email address" name="email" type="email" value={draft.email} onChange={updateField} error={errors.email} required />
          <ProfileField label="Contact number" name="phone" type="tel" value={draft.phone} onChange={updateField} error={errors.phone} required help="Use a valid Indian mobile number." />
          <ProfileField label="City" name="city" value={draft.city} onChange={updateField} />
          <ProfileField label="State" name="state" value={draft.state} onChange={updateField} />
          <ProfileField label="Short bio" name="bio" value={draft.bio} onChange={updateField} wide help="Optional profile description, up to 240 characters." />
        </div> : <div className="profile-info-grid">
          <InfoItem icon={Mail} label="Email address" value={draft.email} />
          <InfoItem icon={Phone} label="Contact number" value={draft.phone} />
          <InfoItem icon={MapPin} label="Location" value={[draft.city, draft.state].filter(Boolean).join(', ')} />
          <InfoItem icon={UserRound} label="Short bio" value={draft.bio} />
        </div>}
      </section>

      <section className="panel profile-section">
        <div className="profile-section-heading"><span className="profile-section-icon"><BriefcaseBusiness size={17} /></span><div><h2>Work information</h2><p>Non-sensitive local demo profile values; they do not represent verified employment details.</p></div></div>
        {editing ? <div className="profile-fields-grid">
          <ProfileField label="Job title" name="jobTitle" value={draft.jobTitle} onChange={updateField} />
          <ProfileField label="Department" name="department" value={draft.department} onChange={updateField} />
          <ProfileSelect label="Preferred language" name="language" value={draft.language} onChange={updateField} options={[
            { value: 'English', label: 'English' }, { value: 'Marathi', label: 'Marathi' }, { value: 'Hindi', label: 'Hindi' },
          ]} />
          <ProfileSelect label="Time zone" name="timeZone" value={draft.timeZone} onChange={updateField} options={[
            { value: 'Asia/Kolkata', label: 'India Standard Time (Asia/Kolkata)' },
            { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
          ]} />
        </div> : <div className="profile-info-grid">
          <InfoItem icon={BriefcaseBusiness} label="Job title" value={draft.jobTitle} />
          <InfoItem icon={MapPin} label="Department" value={draft.department} />
          <InfoItem icon={Globe2} label="Preferred language" value={draft.language} />
          <InfoItem icon={Clock3} label="Time zone" value={draft.timeZone} />
        </div>}
      </section>

      <section className="panel profile-section">
        <div className="profile-section-heading"><span className="profile-section-icon"><SlidersHorizontal size={17} /></span><div><h2>Profile preferences</h2><p>Personal display preferences for this demo profile, separate from business-wide Settings.</p></div></div>
        {editing ? <div className="profile-fields-grid">
          <ProfileSelect label="Preferred dashboard landing page" name="landingPage" value={draft.landingPage} onChange={updateField} options={profileLandingPages} />
          <ProfileSelect label="Default table page size" name="tablePageSize" value={draft.tablePageSize} onChange={updateField} options={['10', '20', '50'].map((value) => ({ value, label: `${value} rows` }))} help="A personal preference; it does not change application-wide defaults." />
          <ProfileSelect label="Date display preference" name="dateFormat" value={draft.dateFormat} onChange={updateField} options={profileDateFormats.map((value) => ({ value, label: value }))} />
          <label className="profile-notification-toggle">
            <span><strong>Show notification previews</strong><small>Controls only the local profile display preference; it does not change notification delivery.</small></span>
            <input type="checkbox" name="showNotificationPreviews" checked={draft.showNotificationPreviews} onChange={updateField} />
          </label>
        </div> : <div className="profile-info-grid">
          <InfoItem icon={SlidersHorizontal} label="Landing page" value={profileLandingPages.find((page) => page.value === draft.landingPage)?.label} />
          <InfoItem icon={SlidersHorizontal} label="Default table size" value={`${draft.tablePageSize} rows`} />
          <InfoItem icon={Clock3} label="Date format" value={draft.dateFormat} />
          <InfoItem icon={Globe2} label="Notification previews" value={draft.showNotificationPreviews ? 'Shown in demo' : 'Hidden in demo'} />
        </div>}
      </section>
    </form>

    {editing && <div className="profile-bottom-actions">
      <span className={isDirty ? 'profile-dirty-indicator is-dirty' : 'profile-dirty-indicator'}><i />{isDirty ? 'You have unsaved changes.' : 'No unsaved changes.'}</span>
      <div><button type="button" className="secondary-button" onClick={cancelEditing}><X size={14} />Cancel</button>{saveButton}</div>
    </div>}

    {confirmation && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmation(null) }}>
      <div className="profile-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="profile-confirm-title" aria-describedby="profile-confirm-copy">
        <div className="modal-header"><div><p className="eyebrow">{confirmation.type === 'reset' ? 'RESTORE DEMO PROFILE' : 'DISCARD EDITS'}</p><h2 id="profile-confirm-title">{confirmation.type === 'reset' ? 'Restore profile defaults?' : 'Discard unsaved changes?'}</h2></div>
          <button type="button" className="modal-close" aria-label="Close dialog" onClick={() => setConfirmation(null)}><X size={18} /></button>
        </div>
        <p id="profile-confirm-copy">{confirmation.type === 'reset'
          ? 'The current demo profile will be replaced with its original fictional defaults for this app session.'
          : 'Your profile edits since the last save will be lost.'}</p>
        <div className="profile-confirm-actions">
          <button type="button" className="secondary-button" onClick={() => setConfirmation(null)}>Keep editing</button>
          <button type="button" className="primary-button" onClick={confirmation.type === 'reset' ? resetDefaults : discardChanges}>{confirmation.type === 'reset' ? <><RotateCcw size={14} />Restore defaults</> : 'Discard changes'}</button>
        </div>
      </div>
    </div>}
  </>
}
