export function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function highlight(json: string): string {
  return json.replace(
    /("(?:\\.|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (m) => {
      if (/^"/.test(m)) return /:$/.test(m) ? `<span class="k">${m}</span>` : `<span class="s">${m}</span>`;
      if (/true|false/.test(m)) return `<span class="b">${m}</span>`;
      if (/null/.test(m)) return `<span class="nl">${m}</span>`;
      return `<span class="n">${m}</span>`;
    }
  );
}
