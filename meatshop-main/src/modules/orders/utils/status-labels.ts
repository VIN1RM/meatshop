export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  PREPARING: "Em preparo",
  READY: "Pronto",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  REJECTED: "Rejeitado",
  REFUNDED: "Reembolsado",
  PARTIALLY_REFUNDED: "Reembolsado parcialmente",
  CHARGED_BACK: "Contestado",
  CANCELLED: "Cancelado",
};

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  DELIVERY: "Entrega",
  PICKUP: "Retirada no balcão",
};

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  WAITING_DELIVERY_PERSON: "Aguardando entregador",
  PICKUP: "Indo buscar",
  ON_THE_WAY: "Em rota",
  DELIVERED: "Entregue",
};

export function deliveryStatusLabel(status: string): string {
  return DELIVERY_STATUS_LABELS[status] ?? "Não informado";
}

export function cancellationReasonLabel(reason: string | null | undefined): string {
  if (!reason?.trim()) return "Não informado";
  if (reason.trim() === "Payment deadline expired") return "Prazo de pagamento expirado";
  return reason;
}

export function orderStatusLabel(status: string, deliveryType?: string): string {
  if (deliveryType === "PICKUP") {
    if (status === "READY") return "Pronto para retirada";
    if (status === "DELIVERED") return "Retirado";
  }
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function paymentMethodLabel(method: string | null | undefined, deliveryType?: string): string {
  if (method === "Card on Delivery") return deliveryType === "PICKUP" ? "Maquininha no balcão" : "Maquininha na entrega";
  const labels: Record<string, string> = { Cash: "Dinheiro", Pix: "Pix", Credit: "Cartão de crédito", Debit: "Cartão de débito", "Credit Card": "Cartão de crédito", "Debit Card": "Cartão de débito" };
  return method ? labels[method] ?? method : "Não informado";
}

export function canCompletePickup(paymentStatus: string): boolean {
  return ["PAID", "PARTIALLY_REFUNDED"].includes(paymentStatus);
}
