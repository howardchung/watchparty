import React from "react";

export interface IconProps
  extends Omit<React.SVGAttributes<SVGSVGElement>, "stroke"> {
  size?: number | string;
  color?: string;
  stroke?: number | string;
  title?: string;
  disabled?: boolean;
}

const BaseIcon: React.FC<
  IconProps & {
    filled?: boolean;
    viewBox?: string;
    children: React.ReactNode;
  }
> = ({
  size = 20,
  color = "currentColor",
  stroke = 2,
  filled = false,
  viewBox = "0 0 24 24",
  title,
  disabled,
  style,
  onClick,
  className,
  children,
  ...rest
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox={viewBox}
    fill={filled ? color : "none"}
    stroke={filled ? "none" : color}
    strokeWidth={filled ? 0 : stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    onClick={disabled ? undefined : onClick}
    style={{
      flexShrink: 0,
      display: "inline-block",
      verticalAlign: "middle",
      opacity: disabled ? 0.45 : 1,
      cursor: disabled ? "not-allowed" : onClick ? "pointer" : undefined,
      ...style,
    }}
    {...rest}
  >
    {title ? <title>{title}</title> : null}
    {children}
  </svg>
);

export const IconAntennaBars5: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M6 18v-3" />
    <path d="M10 18v-6" />
    <path d="M14 18v-9" />
    <path d="M18 18v-12" />
  </BaseIcon>
);

export const IconArrowDown: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M12 5v14" />
    <path d="M18 13l-6 6" />
    <path d="M6 13l6 6" />
  </BaseIcon>
);

export const IconArrowLeft: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M5 12h14" />
    <path d="M5 12l6 6" />
    <path d="M5 12l6 -6" />
  </BaseIcon>
);

export const IconArrowRight: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M5 12h14" />
    <path d="M13 18l6 -6" />
    <path d="M13 6l6 6" />
  </BaseIcon>
);

export const IconArrowUp: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M12 5v14" />
    <path d="M18 11l-6 -6" />
    <path d="M6 11l6 -6" />
  </BaseIcon>
);

export const IconBackspace: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M20 6a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-11l-5 -5a1.5 1.5 0 0 1 0 -2l5 -5z" />
    <path d="M12 10l4 4m0 -4l-4 4" />
  </BaseIcon>
);

export const IconBadgeCc: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M10 10.5a1.5 1.5 0 0 0 -3 0v3a1.5 1.5 0 0 0 3 0" />
    <path d="M17 10.5a1.5 1.5 0 0 0 -3 0v3a1.5 1.5 0 0 0 3 0" />
  </BaseIcon>
);

export const IconBan: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.7 5.7l12.6 12.6" />
  </BaseIcon>
);

export const IconBrandDiscord: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <path d="M7.5 7.5c3.5 -1 5.5 -1 9 0" />
    <path d="M7 16.5c3.5 1 6.5 1 10 0" />
    <path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-1 2.5" />
    <path d="M8.5 17c0 1 -1.356 3 -1.832 3c-1.429 0 -2.698 -1.667 -3.333 -3c-.635 -1.667 -.476 -5.833 1.428 -11.5c1.388 -1.015 2.782 -1.34 4.237 -1.5l1 2.5" />
  </BaseIcon>
);

export const IconBrandDiscordFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M14.983 3l.123 .006c2.014 .214 3.527 .672 4.966 1.673a1 1 0 0 1 .371 .488c1.876 5.315 2.373 9.987 1.451 12.28c-1.003 2.005 -2.606 3.553 -4.394 3.553c-.732 0 -1.693 -1.075 -2.328 -2.148a18.5 18.5 0 0 1 -6.344 0c-.635 1.073 -1.596 2.148 -2.328 2.148c-1.788 0 -3.391 -1.548 -4.394 -3.553c-.922 -2.293 -.425 -6.965 1.451 -12.28a1 1 0 0 1 .371 -.488c1.439 -1.001 2.952 -1.459 4.966 -1.673a1 1 0 0 1 1.035 .662l.481 1.2a13.8 13.8 0 0 1 3.172 0l.481 -1.2a1 1 0 0 1 .912 -.668zm-5.983 7a2 2 0 0 0 -1.995 1.85l-.005 .15a2 2 0 1 0 2 -2zm6 0a2 2 0 0 0 -1.995 1.85l-.005 .15a2 2 0 1 0 2 -2z" />
  </BaseIcon>
);

export const IconBrandFacebookFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M18 2a1 1 0 0 1 .993 .883l.007 .117v4a1 1 0 0 1 -.883 .993l-.117 .007h-3v1h3a1 1 0 0 1 .991 1.131l-.02 .112l-1 4a1 1 0 0 1 -.858 .75l-.113 .007h-2v6a1 1 0 0 1 -.883 .993l-.117 .007h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-6h-2a1 1 0 0 1 -.993 -.883l-.007 -.117v-4a1 1 0 0 1 .883 -.993l.117 -.007h2v-1a6 6 0 0 1 5.775 -5.996l.225 -.004h3z" />
  </BaseIcon>
);

export const IconBrandGithub: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
  </BaseIcon>
);

export const IconBrandGoogleFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" />
  </BaseIcon>
);

export const IconBrandGravatar: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M5.64 5.632a9 9 0 1 0 6.36 -2.632v7.714" />
  </BaseIcon>
);

export const IconBrandStripeFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M13.4 10.6c-1.8 -.6 -2.4 -1 -2.4 -1.7c0 -.6 .5 -1 1.4 -1c1.2 0 2.4 .4 3.2 .9l.5 -3c-.9 -.4 -2.1 -.8 -3.8 -.8c-3.2 0 -5.4 1.7 -5.4 4.2c0 2.8 2.2 3.7 4.4 4.4c1.9 .6 2.5 1.1 2.5 1.8c0 .7 -.6 1.1 -1.7 1.1c-1.3 0 -2.8 -.5 -3.9 -1.1l-.5 3.1c1.1 .6 2.7 1 4.4 1c3.4 0 5.7 -1.6 5.7 -4.3c0 -2.7 -2.1 -3.8 -4.4 -4.6z" />
  </BaseIcon>
);

export const IconBrandYoutubeFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M18 3a5 5 0 0 1 5 5v8a5 5 0 0 1 -5 5h-12a5 5 0 0 1 -5 -5v-8a5 5 0 0 1 5 -5zm-9 6v6a1 1 0 0 0 1.514 .857l5 -3a1 1 0 0 0 0 -1.714l-5 -3a1 1 0 0 0 -1.514 .857z" />
  </BaseIcon>
);

export const IconBrowser: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 8h16" />
    <path d="M8 4v4" />
  </BaseIcon>
);

export const IconCheck: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M5 12l5 5l10 -10" />
  </BaseIcon>
);

export const IconChevronDown: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M6 9l6 6l6 -6" />
  </BaseIcon>
);

export const IconChevronLeft: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M15 6l-6 6l6 6" />
  </BaseIcon>
);

export const IconChevronRight: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M9 6l6 6l-6 6" />
  </BaseIcon>
);

export const IconChevronUp: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M6 15l6 -6l6 6" />
  </BaseIcon>
);

export const IconCircleCheck: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2l4 -4" />
  </BaseIcon>
);

export const IconCircleCheckFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
  </BaseIcon>
);

export const IconCirclePlusFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M4.929 4.929a10 10 0 1 1 14.141 14.141a10 10 0 0 1 -14.14 -14.14zm8.071 4.071a1 1 0 1 0 -2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0 -2h-2v-2z" />
  </BaseIcon>
);

export const IconClipboard: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="2" />
  </BaseIcon>
);

export const IconCopy: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
  </BaseIcon>
);

export const IconCornerDownLeft: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M18 6v6a3 3 0 0 1 -3 3h-10l4 -4m0 8l-4 -4" />
  </BaseIcon>
);

export const IconDatabase: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v6a8 3 0 0 0 16 0v-6" />
    <path d="M4 12v6a8 3 0 0 0 16 0v-6" />
  </BaseIcon>
);

export const IconDeviceFloppy: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
    <circle cx="12" cy="14" r="2" />
    <path d="M14 4v4h-6v-4" />
  </BaseIcon>
);

export const IconDeviceMobile: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect x="6" y="3" width="12" height="18" rx="2" />
    <path d="M11 4h2" />
    <path d="M12 17v.01" />
  </BaseIcon>
);

export const IconDotsVertical: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
    <circle cx="12" cy="5" r="1" />
  </BaseIcon>
);

export const IconDownload: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
    <path d="M7 11l5 5l5 -5" />
    <path d="M12 4v12" />
  </BaseIcon>
);

export const IconEye: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="2" />
    <path d="M22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7" />
  </BaseIcon>
);

export const IconEyeOff: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
    <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
    <path d="M3 3l18 18" />
  </BaseIcon>
);

export const IconFile: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
  </BaseIcon>
);

export const IconHeadphones: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect x="4" y="13" rx="2" width="4" height="6" />
    <rect x="16" y="13" rx="2" width="4" height="6" />
    <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
  </BaseIcon>
);

export const IconHelpCircle: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v.01" />
    <path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483" />
  </BaseIcon>
);

export const IconHome: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
    <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
  </BaseIcon>
);

export const IconHourglass: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M6.5 7h11" />
    <path d="M6.5 17h11" />
    <path d="M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z" />
    <path d="M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1z" />
  </BaseIcon>
);

export const IconKey: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="8" cy="15" r="4" />
    <path d="M10.85 12.15l8.15 -8.15" />
    <path d="M18 5l2 2" />
    <path d="M15 8l2 2" />
  </BaseIcon>
);

export const IconKeyFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M14.52 2c1.029 0 2.015 .409 2.742 1.136l3.602 3.602a3.877 3.877 0 0 1 0 5.483l-2.643 2.643a3.88 3.88 0 0 1 -4.941 .452l-.105 -.078l-5.882 5.883a3 3 0 0 1 -1.68 .843l-.22 .027l-.221 .009h-1.172c-1.014 0 -1.867 -.759 -1.991 -1.823l-.009 -.177v-1.172c0 -.704 .248 -1.386 .73 -1.96l.149 -.161l.414 -.414a1 1 0 0 1 .707 -.293h1v-1a1 1 0 0 1 .883 -.993l.117 -.007h1v-1a1 1 0 0 1 .206 -.608l.087 -.1l1.468 -1.469l-.076 -.103a3.9 3.9 0 0 1 -.678 -1.963l-.007 -.236c0 -1.029 .409 -2.015 1.136 -2.742l2.643 -2.643a3.88 3.88 0 0 1 2.741 -1.136zm.495 5h-.02a2 2 0 1 0 0 4h.02a2 2 0 1 0 0 -4z" />
  </BaseIcon>
);

export const IconKeyboardFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M20 5a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-16a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3zm-12 10a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1zm8 0h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0 -2zm4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1zm-14 -4a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1zm4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1zm4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1zm4 0a1 1 0 0 0 -1 1v.01a1 1 0 0 0 2 0v-.01a1 1 0 0 0 -1 -1z" />
  </BaseIcon>
);

export const IconLink: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M9 15l6 -6" />
    <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
    <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
  </BaseIcon>
);

export const IconList: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M9 6h11" />
    <path d="M9 12h11" />
    <path d="M9 18h11" />
    <path d="M5 6v.01" />
    <path d="M5 12v.01" />
    <path d="M5 18v.01" />
  </BaseIcon>
);

export const IconLogin: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
    <path d="M21 12h-13l3 -3" />
    <path d="M11 15l-3 -3" />
  </BaseIcon>
);

export const IconLogout: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
    <path d="M9 12h12l-3 -3" />
    <path d="M18 15l3 -3" />
  </BaseIcon>
);

export const IconMagnetFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M21 9v4a9 9 0 0 1 -18 0v-4h5v4a4 4 0 0 0 8 0v-4zm-16 -6a2 2 0 0 1 2 2v2h-5v-2a2 2 0 0 1 2 -2zm14 0a2 2 0 0 1 2 2v2h-5v-2a2 2 0 0 1 2 -2z" />
  </BaseIcon>
);

export const IconMailFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M22 7.535v9.465a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-9.465l9.445 6.297l.116 .066a1 1 0 0 0 .878 0l.116 -.066l9.445 -6.297z" />
    <path d="M19 4c1.08 0 2.027 .57 2.555 1.427l-9.555 6.37l-9.555 -6.37a2.999 2.999 0 0 1 2.354 -1.42l.201 -.007h14z" />
  </BaseIcon>
);

export const IconMaximize: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
    <path d="M4 16v2a2 2 0 0 0 2 2h2" />
    <path d="M16 4h2a2 2 0 0 1 2 2v2" />
    <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
  </BaseIcon>
);

export const IconMessageFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-4.724l-4.762 2.857a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2h-1a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-4 9h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2zm2 -4h-8a1 1 0 1 0 0 2h8a1 1 0 0 0 0 -2z" />
  </BaseIcon>
);

export const IconMicrophone: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </BaseIcon>
);

export const IconMouse: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect x="6" y="3" width="12" height="18" rx="4" />
    <path d="M12 7v4" />
  </BaseIcon>
);

export const IconMovie: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 4v16" />
    <path d="M16 4v16" />
    <path d="M4 8h4" />
    <path d="M4 16h4" />
    <path d="M4 12h16" />
    <path d="M16 8h4" />
    <path d="M16 16h4" />
  </BaseIcon>
);

export const IconPaintFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M17 2a3 3 0 0 1 3 3v2a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-2a3 3 0 0 1 3 -3z" />
    <path d="M19 6h1a2 2 0 0 1 2 2a3 3 0 0 1 -3 3h-6v3h1a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2h1v-3a2 2 0 0 1 2 -2h5a1 1 0 0 0 1 -1v-1h-1z" />
  </BaseIcon>
);

export const IconPlayerPauseFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
    <path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" />
  </BaseIcon>
);

export const IconPlayerPlayFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
  </BaseIcon>
);

export const IconPlayerSkipForwardFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M3 5v14a1 1 0 0 0 1.504 .864l12 -7a1 1 0 0 0 0 -1.728l-12 -7a1 1 0 0 0 -1.504 .864z" />
    <path d="M20 4a1 1 0 0 1 .993 .883l.007 .117v14a1 1 0 0 1 -1.993 .117l-.007 -.117v-14a1 1 0 0 1 1 -1z" />
  </BaseIcon>
);

export const IconPlaylistAdd: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M19 8h-14" />
    <path d="M5 12h9" />
    <path d="M11 16h-6" />
    <path d="M15 16h6" />
    <path d="M18 13v6" />
  </BaseIcon>
);

export const IconPointer: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M7.904 17.563a1.2 1.2 0 0 0 2.228 .308l2.09 -3.093l4.907 4.907a1.067 1.067 0 0 0 1.509 0l1.047 -1.047a1.067 1.067 0 0 0 0 -1.509l-4.907 -4.907l3.113 -2.09a1.2 1.2 0 0 0 -.309 -2.228l-13.582 -3.904l3.904 13.563z" />
  </BaseIcon>
);

export const IconRefresh: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
    <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
  </BaseIcon>
);

export const IconRepeat: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" />
    <path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" />
  </BaseIcon>
);

export const IconScreenShare: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M21 12v3a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h9" />
    <path d="M7 20h10" />
    <path d="M9 16v4" />
    <path d="M15 16v4" />
    <path d="M17 4h4v4" />
    <path d="M16 9l5 -5" />
  </BaseIcon>
);

export const IconSearch: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="10" cy="10" r="7" />
    <path d="M21 21l-6 -6" />
  </BaseIcon>
);

export const IconSend: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M10 14l11 -11" />
    <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
  </BaseIcon>
);

export const IconSettings: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
);

export const IconStarFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
  </BaseIcon>
);

export const IconTheater: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M15 5v14" />
  </BaseIcon>
);

export const IconTool: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5" />
  </BaseIcon>
);

export const IconTrash: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 7h16" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
  </BaseIcon>
);

export const IconTrashFilled: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} filled>
    <path d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-.081l-.919 11a3 3 0 0 1 -2.824 2.995l-.176 .005h-8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-.005 -.167l-.923 -11.083h-.08a1 1 0 0 1 -.117 -1.993l.117 -.007h16z" />
    <path d="M14 2a2 2 0 0 1 2 2a1 1 0 0 1 -1.993 .117l-.007 -.117h-4l-.007 .117a1 1 0 0 1 -1.993 -.117a2 2 0 0 1 1.85 -1.995l.15 -.005h4z" />
  </BaseIcon>
);

export const IconUpload: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
    <path d="M7 9l5 -5l5 5" />
    <path d="M12 4v12" />
  </BaseIcon>
);

export const IconUser: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </BaseIcon>
);

export const IconUserPlus: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 11h6" />
    <path d="M19 8v6" />
  </BaseIcon>
);

export const IconUserScreen: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M19.03 17.818a3 3 0 0 0 1.97 -2.818v-8a3 3 0 0 0 -3 -3h-12a3 3 0 0 0 -3 3v8c0 1.317 .85 2.436 2.03 2.84" />
    <circle cx="12" cy="11" r="2" />
    <path d="M8 19a4 4 0 0 1 8 0" />
  </BaseIcon>
);

export const IconUsersGroup: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
    <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M17 10h2a2 2 0 0 1 2 2v1" />
    <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
  </BaseIcon>
);

export const IconVideo: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" />
    <rect x="3" y="6" width="12" height="12" rx="2" />
  </BaseIcon>
);

export const IconVolume: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M15 8a5 5 0 0 1 0 8" />
    <path d="M17.7 5a9 9 0 0 1 0 14" />
    <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
  </BaseIcon>
);

export const IconVolumeOff: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5 5 0 0 1 -.535 .464" />
    <path d="M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9 9 0 0 1 -.686 .615" />
    <path d="M9.069 5.054l.431 -.554a.8 .8 0 0 1 1.5 .5v2m0 4v8a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664" />
    <path d="M3 3l18 18" />
  </BaseIcon>
);

export const IconX: React.FC<IconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </BaseIcon>
);
