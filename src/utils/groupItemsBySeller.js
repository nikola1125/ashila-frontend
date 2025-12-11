export const groupItemsBySeller = (items) => {
  if (!items) return [];
  const sellersMap = {};

  items.forEach((item) => {
    if (!sellersMap[item.seller]) {
      sellersMap[item.seller] = {
        seller: item.seller,
        items: [],
        totalAmount: 0,
      };
    }
    sellersMap[item.seller].items.push({
      ...item,
    });
    sellersMap[item.seller].totalAmount +=
      Number(item.discountedPrice) * Number(item.quantity);
  });
  console.table(Object.values(sellersMap));
  return Object.values(sellersMap);
};