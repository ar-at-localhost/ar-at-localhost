import type { AnchorHTMLAttributes, DetailedHTMLProps, FC } from "react";
import { buttonVariants } from "ui/components/button";

export const LinkBtn: FC<
  DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>
> = ({ children, ...props }) => (
  <a
    {...props}
    className={`${buttonVariants({
      size: "icon",
    })} bg-gray-500! dark:bg-gray-600! ${props.className}`}
  >
    {children}
  </a>
);
