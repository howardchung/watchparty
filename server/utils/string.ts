export function hashString(input: string) {
  var hash = 0;
  for (var i = 0; i < input.length; i++) {
    var charCode = input.charCodeAt(i);
    hash += charCode;
  }
  return hash;
}
