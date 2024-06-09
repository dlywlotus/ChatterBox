import getformatedDate from "./getFormatedDate";

export default function getDateOnly(timestring) {
  return getformatedDate(timestring)
    .slice(0, 10)
    .split("-")
    .sort((a, b) => a - b)
    .join("/");
}
