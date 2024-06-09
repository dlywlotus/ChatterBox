import getformatedDate from "./getFormatedDate";

export default function getOnlyTime(timestring) {
  const time = getformatedDate(timestring);
  return time;
}
