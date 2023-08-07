export const getInitials = (name: string) => {
  const names = name.split(" ");
  let initials = "";
  names.forEach((n) => {
    initials += n[0];
  });
  return initials;
};

export const getLocalizedPrivacyName = (privacy: string) => {
  switch (privacy) {
    case "private":
      return "Private";
    case "public":
      return "Public";
    case "invite":
      return "Invite Only";
    default:
      return "Unknown";
  }
};
export function millisToMinutesAndSeconds(millis: number) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0) as unknown as number;
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}
