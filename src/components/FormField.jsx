export default function FormField({ label, required = false, children, hint }) {
  return (
    <div className="field">
      <label>
        {label}{required ? <span className="required">*</span> : null}
      </label>
      {children}
      {hint ? <small className="field-hint">{hint}</small> : null}
    </div>
  )
}
