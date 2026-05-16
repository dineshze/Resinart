export function createCodPayment() {
  return {
    method: "cod",
    status: "cod_pending",
    metadata: {
      collectionMode: "cash_on_delivery"
    }
  };
}
