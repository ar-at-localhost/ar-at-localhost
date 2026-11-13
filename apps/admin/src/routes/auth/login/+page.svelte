<script lang="ts">
import { PUBLIC_SRV_AUTH_URL } from '$app/env/public';
import { emailLoginBodySchema, type EmailLoginBody } from 'lib';
import { createForm, Field, Form } from '@formisch/svelte';
import { Button } from 'ui/svelte/button/index';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from 'ui/svelte/card/index';
import { Input } from 'ui/svelte/input/index';
import { Field as InputField, FieldLabel } from 'ui/svelte/field/index';
import { LoaderCircle, TriangleAlert } from '@lucide/svelte';
import { emailLoginMutationSv } from 'lib/svelte';
import { goto } from '$app/navigation';
  import { setAuth } from '#lib';


const form = createForm({
  schema: emailLoginBodySchema
})


const srv = emailLoginMutationSv({
  srvArgs: {
    baseURL: PUBLIC_SRV_AUTH_URL,
  }, 
  opts: {
    onSuccess: (res) => {
      setAuth(res);
      goto('/')
    }
  }
})

const handleSubmit = async (body: EmailLoginBody) => {
  srv.mutate({
    body
  });
}
</script>

<div class="w-screen h-screen flex flex-row items-center justify-center">
  <Card class={`w-full md:w-3/4 lg:w-1/4 ${srv.error && 'outline outline-red-500'}`}>
    <CardHeader>
      <CardTitle>Login</CardTitle>
      <CardDescription>
        {#if srv.error}
          <span class="inline-flex items-center gap-1 text-red-500 text-sm">
            <TriangleAlert size="14" />
            <span>{srv.error.message}</span>
          </span>
        {:else}
          Enter your email / password to login.
        {/if}
      </CardDescription>
    </CardHeader>

    <CardContent>
      <Form of={form} onsubmit={handleSubmit} class="flex flex-col gap-2" id="login-form">
        <Field of={form} path={['email']}>
          {#snippet children(field)}
            <InputField>
              <FieldLabel>Email address</FieldLabel>
              <Input {...field.props} type="email"/>
            </InputField>
          {/snippet}
        </Field>

        <Field of={form} path={['password']}>
          {#snippet children(field)}
            <InputField>
              <FieldLabel>Password</FieldLabel>
              <Input {...field.props} type="password" />
            </InputField>
          {/snippet}
        </Field>
      </Form>
    </CardContent>

    <CardFooter class="flex flex-col gap-1">
      <Button class="w-full" type="submit" form="login-form" disabled={srv.isPending}>
        {#if srv.isPending}
          <LoaderCircle data-icon="inline-start" class="animate-spin" />
        {/if}

        Login
      </Button>

      <Button disabled class="w-full">Login with Google</Button>
    </CardFooter>
  </Card>
</div>
