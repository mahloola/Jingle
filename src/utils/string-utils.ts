export const decodeHTML = (encodedString: string) => {
  const parser = new DOMParser();
  return parser.parseFromString(encodedString, "text/html").body.textContent;
};
