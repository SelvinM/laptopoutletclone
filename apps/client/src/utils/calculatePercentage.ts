export const calculatePercentage = (
  total: number = 0,
  subtotal: number = 0
) => {
  const diff = total - subtotal;
  const result = Math.trunc((diff / total) * 10000) / 100;
  return result;
};
