import { createCodPayment } from "./codProvider.js";

const providers = {
  cod: {
    createPayment: createCodPayment
  }
};

export function createPaymentForOrder(method) {
  const provider = providers[method];
  if (!provider) {
    const error = new Error("Unsupported payment method");
    error.status = 400;
    throw error;
  }
  return provider.createPayment();
}
