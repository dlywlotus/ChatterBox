export default function getformatedDate(datestring) {
  return datestring.slice(0, -5).split("T").join(" ");
}
