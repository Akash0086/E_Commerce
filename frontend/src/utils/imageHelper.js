export const getProductImage = (image) => {
  if (!image) return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("/")
  ) {
    return image;
  }
  return `/images/${image}`;
};
