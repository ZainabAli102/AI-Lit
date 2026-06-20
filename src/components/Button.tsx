import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";

type SharedButtonProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
};

type ButtonProps =
  | (SharedButtonProps & {
      href: string;
      type?: never;
      onClick?: never;
    })
  | (SharedButtonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never });

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#116466] text-white shadow-sm hover:bg-[#0b4d4f]",
  secondary: "border border-[#cad6cf] bg-white text-[#17211c] hover:border-[#116466] hover:text-[#0b4d4f]",
  ghost: "text-[#42514a] hover:bg-[#edf2ee] hover:text-[#17211c]"
};

export function Button({ children, className, icon, variant = "primary", ...props }: ButtonProps) {
  const classes = clsx(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116466]",
    variantClasses[variant],
    className
  );

  if ("href" in props && props.href) {
    return (
      <Link className={classes} href={props.href}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
