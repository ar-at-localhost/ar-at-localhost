import { Button } from "@/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/card";
import { Field, FieldDescription, FieldLabel } from "@/components/field";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { PlusCircleIcon, SendIcon } from "lucide-react";
import type { FC } from "react";

type Props = {};

export const Form: FC<Props> = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send a brief</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input placeholder="First name" type="text" />
          </Field>

          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input placeholder="Last name" type="text" />
            <FieldDescription className="text-xs">Optional</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="Email">Email</FieldLabel>
            <Input placeholder="Please enter your email" type="email" />
          </Field>

          <Field>
            <FieldLabel htmlFor="message">Message</FieldLabel>
            <Textarea placeholder="Tell me about your project" />
          </Field>
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full flex flex-col items-center gap-2">
          <Button variant="default" className="w-full">
            <SendIcon data-icon="inline-start" />
            Send
          </Button>

          <Button className="flex flex-row items-center gap-1 text-[9px]" variant="ghost">
            <PlusCircleIcon size={16} data-icon="inline-start" />
            <span>Your data is safe and you&rsquo;re in control.</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
