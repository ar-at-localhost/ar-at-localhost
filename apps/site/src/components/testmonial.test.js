import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it } from "vitest";
import Testmonial from "./testimonial.astro";
import { randAvatar, randCompanyName, randFullName, randNumber, randQuote } from "@ngneat/falso";

describe("Testmonial", () => {
  it("should render", async () => {
    const container = await AstroContainer.create();

    const props = {
      avatar: randAvatar({ maxCharCount: 1 }),
      name: randFullName(),
      company: randCompanyName(),
      rating: randNumber({ min: 1, max: 5, fraction: 2 }),
      quote: randQuote({ maxCharCount: 256 }),
    };

    const result = await container.renderToString(Testmonial, {
      props: {
        rating: props.rating,
      },

      slots: props,
    });

    expect(result).toContain(props.avatar);
    expect(result).toContain(props.name);
    expect(result).toContain(props.company);
    expect(result).toContain(props.rating);
    expect(result).toContain(props.quote);
  });
});
