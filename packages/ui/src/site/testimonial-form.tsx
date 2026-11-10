import { useForm, Form, Field as FField, type SubmitHandler, useField } from "@formisch/react";
import {
  delTestimonialReqSrv,
  getTestimonialReqSrv,
  recordTestimonialBodySchema,
  recordTestimonialSrv,
  type TestimonialRequest,
} from "lib";
import { ArrowLeft, LoaderCircle, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState, type FC } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#components/dialog.tsx";
import { NativeSelect, NativeSelectOption } from "#components/native-select.tsx";
import { Separator } from "#components/separator.tsx";
import { Button } from "@/components/button";
import { Card, CardContent, CardFooter } from "@/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/field";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";

import { Testimonial } from "./testimonial";

type Props = {
  baseURL: string;
};

const ratingOptions: string[] = [];
let rating = 5.0;
while (rating >= 1) {
  ratingOptions.push(rating.toPrecision(2));
  rating -= 0.5;
}

export const TestimonialForm: FC<Props> = ({ baseURL }) => {
  const [dataErr, setDataErr] = useState<{ statusCode: number }>();
  const [data, setData] = useState<TestimonialRequest>();
  const [token, setToken] = useState<string>();
  const [redirectInfo, setRedirectInfo] = useState<{ timeout: number; to: string }>();

  const [submission, setSubmission] = useState<{
    loading?: boolean;
    ok?: boolean;
    err?: string;
  }>();

  const [deletion, setDeletion] = useState<{
    confirm?: boolean;
    deleted?: boolean;
    err?: boolean;
    loading?: boolean;
    redirect?: number;
  }>();

  const form = useForm({
    schema: recordTestimonialBodySchema,
  });

  const rating = useField(form, {
    path: ["rating"],
  });

  const testimonial = useField(form, {
    path: ["testimonial"],
  });

  const handleSubmit: SubmitHandler<typeof recordTestimonialBodySchema> = async (body) => {
    setSubmission({ loading: true });
    await recordTestimonialSrv({
      body,
      baseURL,
      bearer: token,
    })
      .then(() => {
        setSubmission({ ok: true });
        setupRedirect();
      })
      .catch((err: Error) => {
        setSubmission({ err: err?.message || "Something went wrong!" });
      });
  };

  const setupRedirect = useCallback((timeout?: number, to?: string) => {
    let redirectIn = timeout || 30;
    const interval = setInterval(() => {
      const done = redirectIn <= 1;

      if (!done) {
        return setRedirectInfo({
          timeout: --redirectIn,
          to: to ?? "/",
        });
      }

      clearInterval(interval);
    }, 1000);
  }, []);

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const encodedToken = params.get("token");
    if (!encodedToken) return;
    const token = atob(encodedToken);
    // oxlint-disable-next-line react/set-state-in-effect
    setToken(token);

    getTestimonialReqSrv({
      bearer: token,
      baseURL,
    })
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        if (err?.statusCode == 401) err.statusCode = 404;
        setDataErr(err);
        const nf = (err as { statusCode: number })?.statusCode === 404;
        setupRedirect(nf ? undefined : 15, nf ? "/" : window.location.href);
      });
  }, [baseURL, setupRedirect]);

  const deleteReq = useCallback(() => {
    setDeletion({ loading: true, confirm: true });
    delTestimonialReqSrv({
      bearer: token,
      baseURL,
    })
      .then(() => {
        setDeletion({
          deleted: true,
        });

        setupRedirect();
      })
      .catch((err) => {
        setDeletion({ err: err?.message || "Something went wrong!", confirm: true });
      });
  }, [baseURL, setDeletion, token, setupRedirect]);

  useEffect(() => {
    if (redirectInfo?.timeout && redirectInfo?.timeout <= 1) {
      window.location.href = redirectInfo?.to ?? "/";
    }
  }, [redirectInfo]);

  return (
    <main className="pb-8 md:pb-0">
      {dataErr ? (
        <Dialog open={true}>
          <DialogContent showCloseButton={false} className="shadow-lg shadow-red-500">
            <DialogHeader>
              <DialogTitle>{dataErr.statusCode === 404 ? "Not found!" : "Oh no..."}</DialogTitle>
              <DialogDescription className={dataErr.statusCode !== 404 ? "text-destructive" : ""}>
                {dataErr.statusCode === 404 ? (
                  <>
                    You&rsquo;ll be redirected to the home page in {redirectInfo?.timeout} seconds.
                  </>
                ) : (
                  <>Something went wrong on my end...</>
                )}
              </DialogDescription>
            </DialogHeader>

            {dataErr.statusCode === 404 ? (
              <>
                <p>
                  I believe you were here to submit your testimonial, but the system couldn&rsquo;t
                  retrieve the necessary information for this request. The request might have
                  expired.
                </p>

                <p>
                  If you believe this is an error, please let me know by replying to the email you
                  received.
                </p>
              </>
            ) : (
              <>
                <p>
                  The system could not retrieve the necessary information about this request. Please
                  try again later.
                </p>

                <p>
                  Your testimonial is valuable, so the system will automatically retry in{" "}
                  {redirectInfo?.timeout} seconds.
                </p>
              </>
            )}

            <DialogFooter>
              <div className="flex flex-col gap-1 w-full">
                <Button
                  variant={"outline"}
                  className={"w-full"}
                  onClick={() => {
                    if (dataErr.statusCode === 404) {
                      window.location.href = "/";
                    } else {
                      window.location.reload();
                    }
                  }}
                >
                  {dataErr.statusCode === 404 ? (
                    <>
                      <ArrowLeft data-icon="inline-start" />
                      Go back to home now
                    </>
                  ) : (
                    <>
                      <RotateCw />
                      Retry now
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : !submission?.ok ? (
        <div className="content flex flex-col items-center md:flex-row md:items-stretch justify-center gap-8 md:gap-16">
          <div className="w-full sm:w-9/10 md:w-96">
            <Card>
              <CardContent>
                <div className="flex flex-col gap-0.5">
                  <Field>
                    <FieldLabel
                      htmlFor="first_name"
                      className="inline-flex items-center justify-between"
                    >
                      <span>First name</span>
                      <span className="text-xs">Auto set</span>
                    </FieldLabel>

                    <Input
                      name="first_name"
                      defaultValue={data?.first_name || ""}
                      placeholder="Fetching..."
                      type="text"
                      autoComplete="given-name"
                      readOnly
                      className="bg-neutral-50"
                    />
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="last_name_initial"
                      className="inline-flex items-center justify-between"
                    >
                      <span>Last name</span>
                      <span className="text-xs">Initial only / Auto set</span>
                    </FieldLabel>

                    <Input
                      name="last_name_initial"
                      defaultValue={data?.last_name_initial || ""}
                      placeholder="Fetching..."
                      type="text"
                      autoComplete="family-name"
                      readOnly
                      className="bg-neutral-50"
                    />
                  </Field>

                  <Field>
                    <FieldLabel
                      htmlFor="email"
                      className="inline-flex items-center justify-between"
                    >
                      <span>Email</span>
                      <span className="text-xs">Auto set</span>
                    </FieldLabel>

                    <Input
                      name="email"
                      defaultValue={data?.email || ""}
                      placeholder="Fetching..."
                      type="email"
                      autoComplete="email"
                      readOnly
                      className="bg-neutral-50"
                    />
                  </Field>
                </div>

                <Form
                  of={form}
                  id="connect-form"
                  onSubmit={handleSubmit}
                  data-testid="connect-form"
                >
                  <FieldGroup className="pt-4">
                    <FField of={form} path={["rating"]}>
                      {(field) => (
                        <Field data-invalid={field.errors !== null}>
                          <FieldLabel
                            htmlFor="rating"
                            className="inline-flex items-center justify-between"
                          >
                            <span>Rating</span>
                            <span className="text-xs">Optional</span>
                          </FieldLabel>

                          <NativeSelect {...field.props}>
                            <NativeSelectOption value={""}>Select a rating</NativeSelectOption>
                            {ratingOptions.map((i) => (
                              <NativeSelectOption key={i} value={i}>
                                {i}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>

                          {field.errors && (
                            <FieldError errors={field.errors.map((message) => ({ message }))} />
                          )}
                        </Field>
                      )}
                    </FField>

                    <FField of={form} path={["testimonial"]}>
                      {(field) => (
                        <Field data-invalid={field.errors !== null}>
                          <FieldLabel htmlFor="testimonial">Message</FieldLabel>
                          <Textarea
                            {...field.props}
                            name="testimonial"
                            placeholder="Tell me about your experience..."
                            rows={5}
                            className="min-h-32 max-h-49 overflow-auto"
                          />
                          {field.errors && (
                            <FieldError errors={field.errors.map((message) => ({ message }))} />
                          )}
                        </Field>
                      )}
                    </FField>
                  </FieldGroup>
                </Form>
              </CardContent>

              <CardFooter>
                <div className="w-full flex flex-col items-center gap-2">
                  <Button
                    variant="default"
                    className="w-full"
                    type="submit"
                    form="connect-form"
                    disabled={!form.isValid}
                  >
                    {submission?.loading ? (
                      <>
                        <LoaderCircle data-icon="inline-start" className="animate-spin" />
                      </>
                    ) : (
                      <></>
                    )}
                    Submit
                  </Button>

                  <div className="text-[9px]">
                    {submission?.err ? <FieldError>{submission?.err}</FieldError> : <></>}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="w-full sm:w-9/10 md:w-96 p-4 rounded-lg border text-base flex flex-col">
            <h2 className="font-bold text-xl">Data Policy</h2>

            <div className="grow flex flex-col gap-4">
              <ul className="list-disc px-4">
                <li>
                  Your first name, last name initial, company name, and testimonial may be displayed
                  publicly on websites.
                </li>
                <li>
                  Your email address is only used to manage this request and is deleted once you
                  submit your testimonial or the request expires.
                </li>
                <li>
                  This link automatically expires in 30 days, at which point the request and all
                  associated information are deleted.
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 py-8 md:py-0">
                <b>Here&rsquo;s how it looks:</b>
                <Testimonial
                  className="w-full text-xs"
                  first_name={data?.first_name}
                  last_name_initial={data?.last_name_initial}
                  company={data?.company}
                  testimonial={testimonial.input || ""}
                  rating={parseInt(rating.input || "0") || undefined}
                ></Testimonial>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeletion({ confirm: true })}
              >
                Delete this request
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Dialog open={true}>
          <DialogContent showCloseButton={false} className="shadow-lg shadow-green-500">
            <DialogHeader>
              <DialogTitle>Testimonial saved</DialogTitle>

              <DialogDescription>
                Thank you for sharing your words &ndash; they are valuable!
              </DialogDescription>
            </DialogHeader>

            <Separator />

            <p>
              You will be automatically redirected to the home page in {redirectInfo?.timeout}{" "}
              seconds. You may close this tab.
            </p>

            <DialogFooter>
              <div className="flex flex-col gap-1 w-full">
                <Button
                  variant={"outline"}
                  className={"w-full"}
                  onClick={() => (window.location.href = "/")}
                >
                  <ArrowLeft data-icon="inline-start" />
                  Go back to home now
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deletion?.confirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {deletion?.deleted ? (
                <>Testimonial request deleted</>
              ) : (
                <>Delete testimonial request</>
              )}
            </DialogTitle>

            {!deletion?.deleted ? (
              <>
                <DialogDescription className={"text-destructive"}>
                  This action cannot be undone.
                </DialogDescription>
              </>
            ) : (
              ""
            )}
          </DialogHeader>

          <Separator />

          {!deletion?.deleted ? (
            <div className="flex flex-col">
              <b>Here&rsquo;s what happens:</b>
              <ul className="list-disc pl-4">
                <li>
                  This request and all associated data will be permanently deleted from the system.
                </li>
                <li>You will no longer be able to submit a testimonial using this link.</li>
                <li>
                  If you change your mind later, you can reply to the original email to request a
                  new link.
                </li>
              </ul>
            </div>
          ) : (
            <>
              <p>
                This testimonial request has been deleted. You will be automatically redirected to
                the home page in {redirectInfo?.timeout} seconds.
              </p>
            </>
          )}

          <DialogFooter>
            <div className="flex flex-col gap-1 w-full">
              {!deletion?.deleted ? (
                <>
                  {deletion?.err ? (
                    <span className="text-destructive">{deletion?.err}</span>
                  ) : (
                    <></>
                  )}

                  <Button variant={"destructive"} className={"w-full"} onClick={deleteReq}>
                    {deletion?.loading ? (
                      <LoaderCircle data-icon="inline-start" className="animate-spin" />
                    ) : (
                      <></>
                    )}
                    Delete this request now
                  </Button>

                  <Button
                    variant={"default"}
                    className={"w-full"}
                    onClick={() => setDeletion({ confirm: false })}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant={"outline"}
                    className={"w-full"}
                    onClick={() => (window.location.href = "/")}
                  >
                    <ArrowLeft data-icon="inline-start" />
                    Go back to home now
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};
