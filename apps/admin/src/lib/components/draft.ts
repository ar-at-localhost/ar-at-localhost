import type { Snippet } from "svelte";

export type BaseDraftProps = {
  children?: Snippet<[]>;
  id: string;
  readonly?: boolean;
  title: string;
  subtitle?: string;
};

export type TextDraftProps = {
  kind: "text";
  content: string;
  oncontent?: (v: string) => void;
} & BaseDraftProps;

export type FileDraft = {
  kind: "file";
  path: string;
} & BaseDraftProps;

export type DraftProps = TextDraftProps | FileDraft;
