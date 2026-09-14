export function linkProblem(value: string): string | null {
  if (/\s/.test(value)) return "Links cannot contain spaces";
  if (!/^https?:\/\//i.test(value)) return "Start the link with https://";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "Enter a valid link, e.g. https://example.com";
  }
  if (!/^(localhost|([a-z0-9-]+\.)+[a-z0-9-]{2,})$/i.test(url.hostname)) {
    return "Enter a valid link, e.g. https://example.com";
  }
  return null;
}

export function validateOptionalLink(value: string): true | string {
  const trimmed = value.trim();
  return trimmed === "" || (linkProblem(trimmed) ?? true);
}
