import { t } from '../i18n';
import './expressive-loading.css';
import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { CircleAlert, Info, X, type LucideIcon } from 'lucide-react';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'filled',
  icon,
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`md-button md-button--${variant} ${fullWidth ? 'md-button--full' : ''} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  variant?: 'standard' | 'tonal' | 'filled' | 'danger';
  selected?: boolean;
}

export function IconButton({
  icon: Icon,
  label,
  variant = 'standard',
  selected = false,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`md-icon-button md-icon-button--${variant} ${selected ? 'is-selected' : ''} ${className}`}
      aria-label={label}
      aria-pressed={props['aria-pressed'] ?? (selected ? true : undefined)}
      data-tooltip={label}
      {...props}
    >
      <Icon aria-hidden="true" size={22} strokeWidth={2.1} />
    </button>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  supportingText?: string;
  error?: string;
  disabled?: boolean;
  trailing?: ReactNode;
  inputMode?: 'text' | 'url';
  autoComplete?: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  supportingText,
  error,
  disabled,
  trailing,
  inputMode = 'text',
  autoComplete = 'off',
}: TextFieldProps) {
  const inputId = useId();
  const supportingId = useId();

  return (
    <div className={`md-field ${error ? 'md-field--error' : ''}`}>
      <label htmlFor={inputId}>{label}</label>
      <div className="md-field__control">
        <input
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          inputMode={inputMode}
          dir={inputMode === 'url' ? 'ltr' : 'auto'}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error || supportingText ? supportingId : undefined}
        />
        {trailing ? <div className="md-field__trailing">{trailing}</div> : null}
      </div>
      {error || supportingText ? (
        <p id={supportingId} className="md-field__supporting">
          {error || supportingText}
        </p>
      ) : null}
    </div>
  );
}

interface DialogProps {
  className?: string;
  open: boolean;
  title: string;
  children: ReactNode;
  actions: ReactNode;
  onClose: () => void;
}

export function Dialog({ open, title, children, actions, onClose, className = '' }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`md-dialog ${className}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <div className="md-dialog__header">
        <h2 id={titleId}>{title}</h2>
        <IconButton icon={X} label={t("Close")} onClick={onClose} />
      </div>
      <div className="md-dialog__content">{children}</div>
      <div className="md-dialog__actions">{actions}</div>
    </dialog>
  );
}

interface SnackbarProps {
  message: string;
  action?: { label: string; onClick: () => void; disabled?: boolean };
  onDismiss: () => void;
}

export function Snackbar({ message, onDismiss, action }: SnackbarProps) {
  if (!message) return null;
  return (
    <div className="md-snackbar" role="status" aria-live="polite">
      <span>{message}</span>
      {action && <Button variant="text" className="md-snackbar__action" onClick={action.onClick} disabled={action.disabled}>{action.label}</Button>}
      <IconButton icon={X} label={t("Dismiss")} onClick={onDismiss} />
    </div>
  );
}

interface StatusCardProps {
  title: string;
  children?: ReactNode;
  tone?: 'info' | 'error';
  loading?: boolean;
  actions?: ReactNode;
  className?: string;
}

/** Persistent feedback uses a tonal M3 card; brief confirmations use Snackbar. */
export function StatusCard({ title, children, tone = 'info', loading = false, actions, className = '' }: StatusCardProps) {
  const Icon = tone === 'error' ? CircleAlert : Info;
  return (
    <div className={`md-status-card md-status-card--${tone} ${className}`}>
      <div className="md-status-card__message" role={tone === 'error' ? 'alert' : 'status'} aria-live={tone === 'error' ? 'assertive' : 'polite'} aria-atomic="true">
        {loading ? <span className="md-loading__shape" aria-hidden="true" /> : <Icon size={24} aria-hidden="true" />}
        <div><strong>{title}</strong>{children && <div className="md-status-card__supporting">{children}</div>}</div>
      </div>
      {actions && <div className="md-status-card__actions">{actions}</div>}
    </div>
  );
}

export function LoadingIndicator({ label, expressive = false }: { label: string; expressive?: boolean }) {
  return (
    <div className={`md-loading${expressive ? ' md-loading--expressive' : ''}`} role="status" aria-live="polite">
      {expressive ? <span className="md-expressive-loading" aria-hidden="true"><span /></span> : <span className="md-loading__shape" aria-hidden="true" />}
      <span>{label}</span>
    </div>
  );
}

