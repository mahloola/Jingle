export const decodeHTML = (encodedString) => {
  var parser = new DOMParser();
  return parser.parseFromString(encodedString, "text/html").body.textContent;
};
