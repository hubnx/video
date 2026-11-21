/**
 * Builds elements in code. Text goes in as text, never parsed as HTML, so file names and transcripts can't
 * inject anything into the window.
 */
type Child = Node | string | null | false | undefined;
type Properties<Tag extends keyof HTMLElementTagNameMap> = Partial<
  Omit<HTMLElementTagNameMap[Tag], "className" | "attributes" | "dataset">
> & {
  className?: string;
  dataset?: Record<string, string>;
  attributes?: Record<string, string>;
};

export function element<Tag extends keyof HTMLElementTagNameMap>(
  tag: Tag,
  properties: Properties<Tag> = {},
  ...children: Child[]
): HTMLElementTagNameMap[Tag] {
  const made = document.createElement(tag);
  const { dataset, attributes, ...rest } = properties;
  Object.assign(made, rest);
  for (const [key, value] of Object.entries(dataset ?? {})) made.dataset[key] = value;
  for (const [key, value] of Object.entries(attributes ?? {})) made.setAttribute(key, value);
  for (const child of children) if (child) made.append(child);
  return made;
}

export function required<Found extends Element>(selector: string, root: ParentNode = document): Found {
  const found = root.querySelector<Found>(selector);
  if (!found) throw new Error(`missing ${selector}`);
  return found;
}
