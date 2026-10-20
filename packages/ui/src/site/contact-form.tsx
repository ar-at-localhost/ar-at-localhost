import { Button } from "@/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/field";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { useForm, Form, Field as FField, SubmitHandler } from "@formisch/react";
import { contactBodySchema, createContactSrv } from "lib";
import { CheckCircle, LoaderCircle, PlusCircleIcon, SendIcon } from "lucide-react";
import { useState, type FC } from "react";

type Props = {
  apiBase?: string;
};

export const ContactForm: FC<Props> = ({ apiBase }) => {
  const [showDataPolicy, setShowDataPolicy] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const form = useForm({
    schema: contactBodySchema,
  });

  const handleSubmit: SubmitHandler<typeof contactBodySchema> = async (body) => {
    setSubmissionError(null);
    await createContactSrv(body, apiBase)
      .then((res) => setSubmissionId(res._id?.toString()))
      .catch((err: Error) => {
        setSubmissionError(err?.message || "Something went off!");
      });
  };

  return (
    <Card
      className={
        !submissionId
          ? ""
          : "not-dark:bg-radial not-dark:from-cyan-100 not-dark:via-blue-100 not-dark:to-cyan-100 dark:bg-stone-900 dark:text-gray-100"
      }
    >
      {!submissionId && (
        <CardHeader>
          <CardTitle>Send a brief</CardTitle>
        </CardHeader>
      )}

      <CardContent>
        {!submissionId ? (
          <Form of={form} id="contact-form" onSubmit={handleSubmit} data-testid="contact-form">
            <FieldGroup>
              <FField of={form} path={["firstName"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="firstName">First name</FieldLabel>
                    <Input
                      {...field.props}
                      name="firstName"
                      defaultValue={field.input || ""}
                      placeholder="First name"
                      type="text"
                      autoComplete="given-name"
                    />
                    {field.errors && (
                      <FieldError errors={field.errors.map((message) => ({ message }))} />
                    )}
                  </Field>
                )}
              </FField>

              <FField of={form} path={["lastName"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                    <Input
                      {...field.props}
                      name="lastName"
                      defaultValue={field.input || ""}
                      placeholder="Last name"
                      type="text"
                      autoComplete="family-name"
                    />
                    {field.errors && (
                      <FieldError errors={field.errors.map((message) => ({ message }))} />
                    )}
                  </Field>
                )}
              </FField>

              <FField of={form} path={["email"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field.props}
                      name="email"
                      defaultValue={field.input || ""}
                      placeholder="Email"
                      type="email"
                      autoComplete="email"
                    />
                    {field.errors && (
                      <FieldError errors={field.errors.map((message) => ({ message }))} />
                    )}
                  </Field>
                )}
              </FField>

              <FField of={form} path={["message"]}>
                {(field) => (
                  <Field data-invalid={field.errors !== null}>
                    <FieldLabel htmlFor="message">Message</FieldLabel>
                    <Textarea
                      {...field.props}
                      name="message"
                      defaultValue={field.input || ""}
                      placeholder="Tell me about your project"
                      rows={5}
                      className="min-h-[128px] max-h-[196px] overflow-auto"
                    />
                    {field.errors && (
                      <FieldError errors={field.errors.map((message) => ({ message }))} />
                    )}
                  </Field>
                )}
              </FField>
            </FieldGroup>
          </Form>
        ) : (
          <div
            className="flex flex-col items-center gap-4 px-4 py-16"
            data-testid="brief-submit-success"
          >
            <CheckCircle size={96} className="text-green-500" />

            <div className="text-center">
              Thank you for submitting your brief. I&rsquo;ll get back to you shortly at the email
              address you&rsquo;ve provided.
            </div>
          </div>
        )}
      </CardContent>

      {!submissionId && (
        <CardFooter>
          <div className="w-full flex flex-col items-center gap-2">
            <Button variant="default" className="w-full" type="submit" form="contact-form">
              {/* FIXME: Loading doesn't seem to work */}
              {!form.isSubmitting ? (
                <>
                  <SendIcon data-icon="inline-start" />
                  Send
                </>
              ) : (
                <>
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                  Sending...
                </>
              )}
            </Button>

            <div className="text-[9px]">
              {submissionError ? (
                <FieldError>{submissionError}</FieldError>
              ) : !showDataPolicy ? (
                <Button
                  className="flex flex-row items-center gap-1 text-[9px]"
                  variant="ghost"
                  onClick={() => setShowDataPolicy(true)}
                >
                  <PlusCircleIcon data-icon="inline-start" />
                  <span>Your data is safe and you&rsquo;re in control.</span>
                </Button>
              ) : (
                <span>
                  Your email and message is stored in encrypted format. I do not share it with
                  anyone. You may request deletion anytime by sending me an mail at
                  <a href="mailto:pro.se.ahmad.raza.1@gmail.com">pro.se.ahmad.raza.1@gmail.com</a>.
                </span>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
