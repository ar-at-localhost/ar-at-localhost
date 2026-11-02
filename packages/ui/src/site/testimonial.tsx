import { cn } from "cn";
import type { TestimonialRecord } from "lib";
import { Dot, Star } from "lucide-react";
import type { FC, ReactNode } from "react";

export const Testimonial: FC<
  {
    className?: string;
    view?: "alt";
    children?: ReactNode;
  } & Partial<TestimonialRecord>
> = ({ className, rating, view, first_name, last_name_initial, company, testimonial }) => {
  const cls = cn(
    "flex flex-col gap-2",
    "rounded-md p-4 border border-violet-200 shadow-md shadow-lime-500",
    "bg-linear-to-tl from-cyan-100 via-blue-100 to-violet-100",
    "dark:bg-linear-to-tl dark:from-stone-700 dark:via-gray-700 dark:to-lime-700",
    className,
  );

  return (
    <div className="flex justify-center text-sm lg:text-xl text-gray-900 dark:text-white">
      {view == "alt" ? (
        <div className="flex flex-col justify-center items-center gap-2">
          {testimonial ? (
            <div className="text-xl font-medium text-center w-4/5 md:w-2/3 lg:w-1/2">
              &ldquo;{testimonial}&rdquo;
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="bg-neutral-100 rounded animate-pulse h-3 w-full"></div>
              <div className="bg-neutral-50 rounded animate-pulse h-2 w-4/5"></div>
              <div className="bg-neutral-100 rounded animate-pulse h-2 w-full"></div>
              <div className="bg-neutral-50 rounded animate-pulse h-2 w-4/5"></div>
            </div>
          )}

          <div className="w-full flex flex-row justify-center items-center text-gray-500 dark:text-gray-400">
            {first_name || last_name_initial ? (
              <span className="font-medium">
                {first_name || ""}
                {first_name && last_name_initial && " "}
                {last_name_initial || ""}
              </span>
            ) : (
              <></>
            )}

            <Dot size="16" />

            {company ? <span className="text-xs lg:text-sm">{company}</span> : <></>}
          </div>
        </div>
      ) : (
        <div className={cls}>
          <div className="flex flex-row gap-4">
            <div
              className={cn(
                "size-8 shrink-0 flex flex-row items-center justify-center text-center text-middle rounded-full bg-gray-500 text-white",
                !first_name ? "animate-pulse bg-neutral-50" : "",
              )}
            >
              {first_name ? <span>{first_name.slice(0, 1) || ""}</span> : <></>}
            </div>

            <div className="w-full flex flex-row items-center">
              {first_name || last_name_initial ? (
                <span className="font-medium">
                  {first_name || ""}
                  {first_name && last_name_initial && " "}
                  {last_name_initial || ""}
                </span>
              ) : (
                <>
                  <div className="bg-neutral-50 rounded animate-pulse h-3 w-16"></div>
                </>
              )}

              <Dot size="16" />

              {company ? (
                <span className="text-xs lg:text-sm">{company}</span>
              ) : (
                <div className="bg-neutral-100 rounded animate-pulse h-3 w-8"></div>
              )}

              <span className="font-medium grow flex flex-row items-center justify-end">
                {rating ? (
                  <span className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-yellow-500" size="12" />
                    <span>{rating}</span>
                  </span>
                ) : (
                  <span>&rdquo;</span>
                )}
              </span>
            </div>
          </div>

          <hr className="border border-lime-500/50" />

          {testimonial ? (
            <div className="font-sans wrap-break-word">
              &ldquo;
              {testimonial}
              &rdquo;
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="bg-neutral-100 rounded animate-pulse h-3 w-full"></div>
              <div className="bg-neutral-50 rounded animate-pulse h-2 w-4/5"></div>
              <div className="bg-neutral-100 rounded animate-pulse h-2 w-full"></div>
              <div className="bg-neutral-50 rounded animate-pulse h-2 w-4/5"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
