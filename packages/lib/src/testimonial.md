# Testimonial

This feature allows user to create [Testimonial Reqests](#testimonial-requests)
to be sent to the past clients, to request them feedback and, to let the clients
submit their feedback to be recorded as [Testimonial](#testimonials)

## Testimonial Requests

A Testimonial Request is an object associated with a particular client feedback
request. It contains essential information about client already, later to be
stored as Testimonial, alongside the feedback / message of the client.

### Important Constraints

- Stored Encrypted
- Only admin may create a new request
- Must provide first name, email and company of the client person.
- Has an associated token for authorization process.
- May live only as long as 30 days.
- Must be removed once client convertes it to Testimonial.

## Testimonials

A Testimonial contains valueable user feedback alongside optional rating.
They can be displayed on website. A Testimonial contains client information
and message. Client information is sourced from Testimonial Reqests, while rating
/ feedback comes from client submission.

### Important Constraints <!-- markdownlint-ignore MD024 -->

- It must not store user email, or its last name fully.
