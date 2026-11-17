export default function PageHeader({ title, description, children }) {
  return <div className="page-header"><div><p className="eyebrow">KOLHAPUR CAB SERVICE</p><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{children && <div className="page-header-actions">{children}</div>}</div>
}
