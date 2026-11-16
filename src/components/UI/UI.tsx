import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./UI.module.css";
import {
  IconCheck,
  IconChevronDown,
  IconEye,
  IconEyeOff,
  IconX,
} from "../Icons/Icons";

const colorClassMap: Record<string, string> = {
  blue: styles.colorBlue,
  indigo: styles.colorIndigo,
  green: styles.colorGreen,
  teal: styles.colorTeal,
  red: styles.colorRed,
  orange: styles.colorOrange,
  yellow: styles.colorYellow,
  violet: styles.colorViolet,
  purple: styles.colorPurple,
  grey: styles.colorGrey,
  gray: styles.colorGray,
  dark: styles.colorDark,
  black: styles.colorBlack,
};

const sizeClassMap: Record<string, string> = {
  "compact-xs": styles.sizeCompactXs,
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
};

/* ---------------- Button ---------------- */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: string;
  color?: string;
  variant?: "filled" | "subtle";
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  component?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  size = "md",
  color,
  variant = "filled",
  leftSection,
  rightSection,
  fullWidth,
  loading,
  disabled,
  component = "button",
  href,
  target,
  rel,
  className = "",
  style,
  children,
  ...rest
}) => {
  const classes = [
    styles.button,
    sizeClassMap[size] || styles.sizeMd,
    variant === "subtle"
      ? styles.variantSubtle
      : color
        ? colorClassMap[color] || styles.colorPrimary
        : styles.colorPrimary,
    fullWidth ? styles.buttonFullWidth : "",
    disabled || loading ? styles.buttonDisabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading ? (
        <span className={`${styles.loader} ${styles.loaderSm}`} />
      ) : (
        leftSection && (
          <span className={styles.buttonSection}>{leftSection}</span>
        )
      )}
      <span>{children}</span>
      {rightSection && (
        <span className={styles.buttonSection}>{rightSection}</span>
      )}
    </>
  );

  if (component === "a" || href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={classes}
        style={style}
        onClick={rest.onClick as any}
        title={rest.title}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      style={style}
      {...rest}
    >
      {content}
    </button>
  );
};

/* ---------------- ActionIcon ---------------- */
export interface ActionIconProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: string | number;
  color?: string;
  component?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
}

export const ActionIcon: React.FC<ActionIconProps> = ({
  size = "md",
  color,
  disabled,
  component = "button",
  href,
  target,
  rel,
  className = "",
  style,
  children,
  ...rest
}) => {
  const sizeClass =
    size === "sm"
      ? styles.actionIconSm
      : size === "lg" || size === "36px"
        ? styles.actionIconLg
        : "";
  const colorClass =
    color && colorClassMap[color] ? colorClassMap[color] : "";

  const classes = [styles.actionIcon, sizeClass, colorClass, className]
    .filter(Boolean)
    .join(" ");

  const customStyle: React.CSSProperties = {
    ...(color && !colorClassMap[color] && color.startsWith("#")
      ? { backgroundColor: color, color: "#090b10" }
      : {}),
    ...style,
  };

  if (component === "a" || href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={classes}
        style={customStyle}
        title={rest.title}
        onClick={rest.onClick as any}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      style={customStyle}
      {...rest}
    >
      {children}
    </button>
  );
};

/* ---------------- TextInput ---------------- */
export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: boolean | React.ReactNode;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  rightSectionWidth?: number;
  size?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      description,
      error,
      leftSection,
      rightSection,
      rightSectionWidth,
      size,
      disabled,
      style,
      className = "",
      ...rest
    },
    ref,
  ) => {
    return (
      <div className={`${styles.inputWrapper} ${className}`} style={style}>
        {label && <label className={styles.inputLabel}>{label}</label>}
        {description && (
          <div className={styles.inputDescription}>{description}</div>
        )}
        <div
          className={[
            styles.inputFieldContainer,
            error ? styles.inputFieldError : "",
            disabled ? styles.inputFieldDisabled : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {leftSection && (
            <div className={styles.inputLeftSection}>{leftSection}</div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={[
              styles.inputElement,
              size === "xs" ? styles.inputElementXs : "",
              leftSection ? styles.inputWithLeft : "",
              rightSection ? styles.inputWithRight : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              rightSectionWidth
                ? { paddingRight: `${rightSectionWidth + 8}px` }
                : undefined
            }
            {...rest}
          />
          {rightSection && (
            <div
              className={styles.inputRightSection}
              style={
                rightSectionWidth ? { width: `${rightSectionWidth}px` } : undefined
              }
            >
              {rightSection}
            </div>
          )}
        </div>
      </div>
    );
  },
);

/* ---------------- PasswordInput ---------------- */
export const PasswordInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ rightSection, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <TextInput
        ref={ref}
        type={visible ? "text" : "password"}
        rightSection={
          rightSection ?? (
            <ActionIcon
              size="sm"
              onClick={() => setVisible((v) => !v)}
              title={visible ? "Hide password" : "Show password"}
              style={{ background: "transparent", border: "none" }}
            >
              {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </ActionIcon>
          )
        }
        {...rest}
      />
    );
  },
);

/* ---------------- Select ---------------- */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  [key: string]: any;
}

export interface SelectProps {
  value?: string | null;
  onChange?: (value: string | null, option?: SelectOption) => void;
  data: (string | SelectOption)[];
  placeholder?: string;
  clearable?: boolean;
  searchable?: boolean;
  onSearchChange?: (query: string) => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  leftSection?: React.ReactNode;
  renderOption?: (args: { option: SelectOption }) => React.ReactNode;
  maxDropdownHeight?: number;
  comboboxProps?: { width?: number | string; position?: string };
  filter?: (args: { options: SelectOption[] }) => SelectOption[];
  style?: React.CSSProperties;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  data,
  placeholder = "Select...",
  clearable,
  searchable,
  onSearchChange,
  onFocus,
  onKeyDown,
  disabled,
  leftSection,
  renderOption,
  maxDropdownHeight = 320,
  comboboxProps,
  style,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: SelectOption[] = data.map((item) =>
    typeof item === "string" ? { value: item, label: item } : item,
  );

  const selectedOption = normalizedOptions.find((o) => o.value === value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${styles.dropdownContainer} ${className}`}
      style={{ minWidth: 155, ...style }}
    >
      <div
        className={[
          styles.inputFieldContainer,
          disabled ? styles.inputFieldDisabled : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          if (!disabled) {
            setOpen((o) => !o);
          }
        }}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        {leftSection && (
          <div className={styles.inputLeftSection}>{leftSection}</div>
        )}
        {searchable ? (
          <input
            type="text"
            disabled={disabled}
            placeholder={placeholder}
            value={searchQuery}
            onFocus={() => {
              setOpen(true);
              onFocus?.();
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchChange?.(e.target.value);
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            className={[
              styles.inputElement,
              leftSection ? styles.inputWithLeft : "",
              styles.inputWithRight,
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ) : (
          <div
            className={[
              styles.inputElement,
              leftSection ? styles.inputWithLeft : "",
              styles.inputWithRight,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              display: "flex",
              alignItems: "center",
              color: selectedOption ? "var(--text-primary)" : "var(--text-muted)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </div>
        )}
        <div className={styles.inputRightSection} style={{ gap: 2 }}>
          {clearable && value && !disabled ? (
            <ActionIcon
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(null);
              }}
              style={{
                background: "transparent",
                border: "none",
                width: 22,
                height: 22,
              }}
            >
              <IconX size={14} />
            </ActionIcon>
          ) : (
            <IconChevronDown size={15} />
          )}
        </div>
      </div>

      {open && !disabled && (
        <div
          className={styles.dropdownPanel}
          style={{
            maxHeight: maxDropdownHeight,
            width: comboboxProps?.width ?? "100%",
          }}
        >
          {normalizedOptions.length === 0 ? (
            <div
              className={`${styles.dropdownOption} ${styles.dropdownOptionDisabled}`}
            >
              No options
            </div>
          ) : (
            normalizedOptions.map((opt) => (
              <div
                key={opt.value}
                className={[
                  styles.dropdownOption,
                  opt.value === value ? styles.dropdownOptionSelected : "",
                  opt.disabled ? styles.dropdownOptionDisabled : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={(e) => {
                  e.stopPropagation();
                  if (opt.disabled) return;
                  onChange?.(opt.value, opt);
                  setOpen(false);
                }}
              >
                {renderOption ? (
                  renderOption({ option: opt })
                ) : (
                  <>
                    <span>{opt.label}</span>
                    {opt.value === value && <IconCheck size={15} />}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ---------------- Autocomplete ---------------- */
export interface AutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  data: string[];
  renderOption?: (args: {
    option: { value: string };
  }) => React.ReactNode;
  maxDropdownHeight?: number;
  style?: React.CSSProperties;
  filter?: (args: { options: any[] }) => any[];
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  value = "",
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  disabled,
  placeholder,
  leftSection,
  rightSection,
  data,
  renderOption,
  maxDropdownHeight = 400,
  style,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={styles.dropdownContainer}
      style={{ width: "100%", ...style }}
    >
      <TextInput
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        leftSection={leftSection}
        rightSection={rightSection}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setTimeout(() => {
            setFocused(false);
            onBlur?.(e);
          }, 180);
        }}
        onKeyDown={onKeyDown}
      />
      {focused && data.length > 0 && !disabled && (
        <div
          className={styles.dropdownPanel}
          style={{ maxHeight: maxDropdownHeight, width: "100%" }}
          onMouseDown={(e) => {
            // Keep input focused when clicking inside dropdown
            e.preventDefault();
          }}
        >
          {data.map((val) => (
            <div key={val} className={styles.dropdownOption}>
              {renderOption ? renderOption({ option: { value: val } }) : val}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------------- Modal ---------------- */
export interface ModalProps {
  opened: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  centered?: boolean;
  size?: string;
  withCloseButton?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  opened,
  onClose,
  title,
  size,
  withCloseButton = true,
  children,
}) => {
  useEffect(() => {
    if (!opened) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [opened, onClose]);

  if (!opened) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={[
          styles.modalDialog,
          size === "auto" || size === "50rem" ? styles.modalAuto : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          size && size !== "auto" && size !== "md"
            ? { maxWidth: size }
            : undefined
        }
      >
        {(title || withCloseButton) && (
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>{title}</div>
            {withCloseButton && (
              <ActionIcon
                size="sm"
                onClick={onClose}
                style={{ background: "transparent", border: "none" }}
              >
                <IconX size={18} />
              </ActionIcon>
            )}
          </div>
        )}
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

/* ---------------- Menu ---------------- */
interface MenuContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
  closeOnItemClick?: boolean;
}

const MenuContext = createContext<MenuContextValue>({
  open: false,
  setOpen: () => {},
});

export interface MenuProps {
  children: React.ReactNode;
  disabled?: boolean;
  closeOnItemClick?: boolean;
  closeOnClickOutside?: boolean;
  trigger?: string;
}

const MenuRoot: React.FC<MenuProps> = ({
  children,
  disabled,
  closeOnItemClick = true,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const hasTarget = React.Children.toArray(children).some(
    (c: any) => c?.type === MenuTarget,
  );

  return (
    <MenuContext.Provider
      value={{ open, setOpen, disabled, closeOnItemClick }}
    >
      <div
        ref={ref}
        className={styles.menuWrapper}
        style={!hasTarget ? { width: "100%", flexDirection: "column" } : undefined}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
};

const MenuTarget: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setOpen, disabled } = useContext(MenuContext);
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) setOpen((o) => !o);
      }}
      style={{ display: "inline-flex", cursor: disabled ? "default" : "pointer" }}
    >
      {children}
    </div>
  );
};

const MenuDropdown: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const { open, disabled } = useContext(MenuContext);
  if (!open || disabled) return null;
  return (
    <div className={styles.menuDropdown} style={style}>
      {children}
    </div>
  );
};

const MenuLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.menuLabel}>{children}</div>
);

const MenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  component?: "button" | "a";
  href?: string;
}> = ({
  children,
  onClick,
  disabled,
  leftSection,
  rightSection,
  component,
  href,
}) => {
  const { setOpen, closeOnItemClick } = useContext(MenuContext);
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    onClick?.(e);
    if (closeOnItemClick) setOpen(false);
  };

  const classes = [
    styles.menuItem,
    disabled ? styles.menuItemDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={styles.menuItemLeft}>
        {leftSection}
        <span style={{ flexGrow: 1, minWidth: 0 }}>{children}</span>
      </span>
      {rightSection && (
        <span className={styles.menuItemRight}>{rightSection}</span>
      )}
    </>
  );

  if (component === "a" || href) {
    return (
      <a href={href} className={classes} onClick={handleClick}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      onClick={handleClick}
    >
      {content}
    </button>
  );
};

export const Menu = Object.assign(MenuRoot, {
  Target: MenuTarget,
  Dropdown: MenuDropdown,
  Label: MenuLabel,
  Item: MenuItem,
});

/* ---------------- Popover ---------------- */
const PopoverContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ open: false, setOpen: () => {} });

const PopoverRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className={styles.menuWrapper}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTarget: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setOpen } = useContext(PopoverContext);
  return (
    <div onClick={() => setOpen((o) => !o)} style={{ display: "inline-flex" }}>
      {children}
    </div>
  );
};

const PopoverDropdown: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { open } = useContext(PopoverContext);
  if (!open) return null;
  return (
    <div
      className={styles.menuDropdown}
      style={{ padding: 12, zIndex: 700, right: 0 }}
    >
      {children}
    </div>
  );
};

export const Popover = Object.assign(PopoverRoot, {
  Target: PopoverTarget,
  Dropdown: PopoverDropdown,
});

/* ---------------- HoverCard ---------------- */
const HoverCardContext = createContext<{ hovered: boolean }>({
  hovered: false,
});

const HoverCardRoot: React.FC<{
  children: React.ReactNode;
  withinPortal?: boolean;
  openDelay?: number;
}> = ({ children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <HoverCardContext.Provider value={{ hovered }}>
      <div
        className={styles.tooltipWrapper}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
};

const HoverCardTarget: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

const HoverCardDropdown: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  const { hovered } = useContext(HoverCardContext);
  if (!hovered) return null;
  return (
    <div className={`${styles.tooltipBubble} ${className}`}>{children}</div>
  );
};

export const HoverCard = Object.assign(HoverCardRoot, {
  Target: HoverCardTarget,
  Dropdown: HoverCardDropdown,
});

/* ---------------- Tooltip ---------------- */
export const Tooltip: React.FC<{
  label: React.ReactNode;
  multiline?: boolean;
  w?: number;
  refProp?: string;
  children: React.ReactNode;
}> = ({ label, w, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={styles.tooltipWrapper}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && (
        <div
          className={styles.tooltipBubble}
          style={w ? { width: w, maxWidth: w } : undefined}
        >
          {label}
        </div>
      )}
    </div>
  );
};

/* ---------------- Switch ---------------- */
export interface SwitchProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onClick?: React.MouseEventHandler<HTMLLabelElement>;
  style?: React.CSSProperties;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  description,
  checked = false,
  disabled = false,
  onChange,
  onClick,
  style,
}) => {
  return (
    <label
      className={[
        styles.switchWrapper,
        disabled ? styles.switchDisabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      onClick={disabled ? undefined : onClick}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange ?? (() => {})}
        style={{ display: "none" }}
      />
      <div
        className={[
          styles.switchTrack,
          checked ? styles.switchTrackChecked : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.switchThumb} />
      </div>
      {(label || description) && (
        <div className={styles.switchTextGroup}>
          {label && <span className={styles.switchLabel}>{label}</span>}
          {description && (
            <span className={styles.switchDescription}>{description}</span>
          )}
        </div>
      )}
    </label>
  );
};

/* ---------------- Checkbox ---------------- */
export interface CheckboxProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  mt?: string;
  style?: React.CSSProperties;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  checked = false,
  disabled = false,
  onChange,
  mt,
  style,
}) => {
  return (
    <label
      className={[
        styles.switchWrapper,
        disabled ? styles.switchDisabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ marginTop: mt === "md" ? 14 : undefined, ...style }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange ?? (() => {})}
        style={{ display: "none" }}
      />
      <div
        className={[
          styles.checkboxBox,
          checked ? styles.checkboxBoxChecked : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {checked && <IconCheck size={13} />}
      </div>
      {(label || description) && (
        <div className={styles.switchTextGroup}>
          {label && <span className={styles.switchLabel}>{label}</span>}
          {description && (
            <span className={styles.switchDescription}>{description}</span>
          )}
        </div>
      )}
    </label>
  );
};

/* ---------------- Badge ---------------- */
export const Badge: React.FC<{
  children: React.ReactNode;
  circle?: boolean;
  size?: string;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}> = ({ children, circle, color, style, className = "" }) => {
  const colorClass =
    color === "red"
      ? styles.badgeRed
      : color === "orange"
        ? styles.badgeOrange
        : color === "green"
          ? styles.badgeGreen
          : "";
  return (
    <span
      className={[
        styles.badge,
        circle ? styles.badgeCircle : "",
        colorClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </span>
  );
};

/* ---------------- Avatar ---------------- */
export const Avatar: React.FC<{
  src?: string | null;
  radius?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
}> = ({ src, radius, onClick, style, className = "" }) => {
  if (!src) {
    return (
      <div
        onClick={onClick}
        className={`${styles.avatar} ${
          radius === "xs" ? styles.avatarRadiusXs : ""
        } ${className}`}
        style={style}
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      onClick={onClick}
      className={`${styles.avatar} ${
        radius === "xs" ? styles.avatarRadiusXs : ""
      } ${className}`}
      style={style}
    />
  );
};

/* ---------------- Alert ---------------- */
export const Alert: React.FC<{
  title?: React.ReactNode;
  color?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ title, color, icon, style, children }) => {
  const colorClass =
    color === "red"
      ? styles.alertRed
      : color === "green"
        ? styles.alertGreen
        : color === "yellow"
          ? styles.alertYellow
          : "";
  return (
    <div className={`${styles.alert} ${colorClass}`} style={style}>
      {icon && <div style={{ flexShrink: 0, marginTop: 2 }}>{icon}</div>}
      <div>
        {title && <div className={styles.alertTitle}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};

/* ---------------- Loader ---------------- */
export const Loader: React.FC<{ size?: string }> = ({ size }) => (
  <span
    className={`${styles.loader} ${size === "sm" ? styles.loaderSm : ""}`}
  />
);

/* ---------------- Overlay ---------------- */
export const Overlay: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className = "", children }) => (
  <div className={`${styles.overlay} ${className}`}>{children}</div>
);

/* ---------------- Title & Text ---------------- */
export const Title: React.FC<{
  order?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}> = ({ order = 2, children, style, className = "" }) => {
  const Tag = `h${order}` as keyof JSX.IntrinsicElements;
  return (
    <Tag
      className={className}
      style={{ margin: "8px 0", fontWeight: 700, ...style }}
    >
      {children}
    </Tag>
  );
};

export const Text: React.FC<{
  size?: "xs" | "sm" | "md" | "lg";
  c?: string;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}> = ({ size, c, style, className = "", children }) => {
  const fontSize =
    size === "xs"
      ? 12
      : size === "sm"
        ? 13
        : size === "lg"
          ? 16
          : 14;
  const color =
    c === "grey" || c === "gray" ? "var(--text-secondary)" : c || undefined;
  return (
    <div className={className} style={{ fontSize, color, ...style }}>
      {children}
    </div>
  );
};

/* ---------------- Divider ---------------- */
export const Divider: React.FC<{
  my?: string;
  label?: React.ReactNode;
  labelPosition?: string;
}> = ({ label }) => (
  <div
    className={`${styles.divider} ${label ? styles.dividerWithLabel : ""}`}
  >
    {label}
  </div>
);

/* ---------------- Table ---------------- */
const TableRoot: React.FC<{
  striped?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ striped, style, children }) => (
  <table
    className={`${styles.table} ${striped ? styles.tableStriped : ""}`}
    style={style}
  >
    {children}
  </table>
);

export const Table = Object.assign(TableRoot, {
  Thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead {...props} />
  ),
  Tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody {...props} />
  ),
  Tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />,
  Th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} />
  ),
  Td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} />
  ),
});

/* ---------------- Progress ---------------- */
const ProgressRoot: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { radius?: string }
> = ({ children, style, className = "", radius, ...rest }) => (
  <div className={`${styles.progressRoot} ${className}`} style={style} {...rest}>
    {children}
  </div>
);

const ProgressSection: React.FC<{
  value: number;
  style?: React.CSSProperties;
}> = ({ value, style }) => (
  <div
    className={styles.progressSection}
    style={{
      width: `${Math.max(0, Math.min(100, value || 0))}%`,
      ...style,
    }}
  />
);

export const Progress = {
  Root: ProgressRoot,
  Section: ProgressSection,
};

/* ---------------- Slider ---------------- */
export const Slider: React.FC<{
  defaultValue?: number;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  onChangeEnd?: (value: number) => void;
}> = ({
  defaultValue = 1,
  disabled,
  min = 0,
  max = 1,
  step = 0.01,
  onChangeEnd,
}) => {
  const [val, setVal] = useState(defaultValue);
  return (
    <input
      type="range"
      className={styles.slider}
      min={min}
      max={max}
      step={step}
      value={val}
      disabled={disabled}
      onChange={(e) => {
        const next = parseFloat(e.target.value);
        setVal(next);
        onChangeEnd?.(next);
      }}
    />
  );
};

/* ---------------- Stepper ---------------- */
const StepperRoot: React.FC<{
  active?: number;
  children: React.ReactNode;
}> = ({ children }) => {
  const steps = React.Children.toArray(children);
  return (
    <div className={styles.stepper}>
      {steps.map((child: any, idx) => (
        <div key={idx} className={styles.stepperStep}>
          <div className={styles.stepperBadge}>{idx + 1}</div>
          <div className={styles.stepperLabel}>{child.props?.label}</div>
        </div>
      ))}
    </div>
  );
};

const StepperStep: React.FC<{ label: React.ReactNode }> = () => null;

export const Stepper = Object.assign(StepperRoot, {
  Step: StepperStep,
});
