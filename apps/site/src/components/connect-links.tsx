import {
  IconBrandFiverr,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandUpwork,
  IconLinkPlus,
  IconMail,
  IconSend,
} from "@tabler/icons-react";
import { cn } from "cn";
import { links } from "lib";
import { useMemo, type FC } from "react";
import { Button } from "ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "ui/components/dropdown-menu";

export const ConnectLink: FC<React.HTMLProps<HTMLAnchorElement>> = (props) => {
  const blank = useMemo(() => !props.href?.startsWith("#"), [props.href]);

  return (
    <a
      target={blank ? "_blank" : "_self"}
      {...props}
      className={cn("flex flex-row items-center gap-2", props.className)}
    >
      {props.children}
    </a>
  );
};

export const ConnectLinks = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size={"icon-lg"}
            className={"md:size-12 lg:size-16 dark:bg-green-500 rounded-full cursor-pointer"}
          >
            <IconLinkPlus className="dark:text-gray-100 md:size-8 md:stroke-2 lg:stroke-3 lg-size-12" />
          </Button>
        }
      />

      <DropdownMenuContent className={"min-w-48"}>
        <DropdownMenuItem>
          <ConnectLink href={links.form}>
            <IconSend />
            Send a project brief
          </ConnectLink>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <ConnectLink href={links.mail}>
            <IconMail />
            Email
          </ConnectLink>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <ConnectLink href={links.github}>
            <IconBrandGithub />
            Github
          </ConnectLink>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <ConnectLink href={links.linkedin}>
            <IconBrandLinkedin />
            LinkedIn
          </ConnectLink>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <ConnectLink href={links.upwork}>
            <IconBrandUpwork />
            Upwork
          </ConnectLink>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <ConnectLink href={links.fiverr}>
            <IconBrandFiverr />
            Fiverr
          </ConnectLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
