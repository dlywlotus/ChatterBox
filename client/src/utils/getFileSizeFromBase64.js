export default function getFileSize(base64String) {
  let numberOfEquals = 0;
  for (let i = 0; i < base64String.length; i++) {
    if (base64String[i] === "=") numberOfEquals += 1;
  }
  return (base64String.length * (3 / 4) - numberOfEquals) / 1024;
}
