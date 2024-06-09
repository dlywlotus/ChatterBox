export default function formatedDateGenerator() {
  const date = new Date().toJSON().slice(0, 10);
  const time = new Date().toUTCString().slice(17, -4);
  const timezoneOffsetInMinutes = new Date().getTimezoneOffset();
  const absoluteOffsetInHours = Math.abs(timezoneOffsetInMinutes / 60);
  const sign = timezoneOffsetInMinutes > 0 ? "+" : "-";
  const timezoneOffset = `${sign}${absoluteOffsetInHours}`;

  return `${date} ${time}${timezoneOffset}`;
}
