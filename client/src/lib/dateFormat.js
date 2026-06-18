export const dateFormat = (date) => {
  return new Date(date).toLocaleString("Nepal", {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};