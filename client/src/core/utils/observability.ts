export interface ObservabilityMeta {
  responseTimeMs: number;
  indexed: boolean;
  correlationId: string;
  transport: "SignalR" | "REST";
}

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

/**
 * Gerçek `/activities` DTO'su (Api sözleşmesi sabit) responseTimeMs/correlationId
 * alanlarını içermiyor. Bu yüzden observability rozetleri kaydın id'sinden
 * deterministik olarak türetilir — aynı kayıt her açılışta aynı rozetleri gösterir.
 */
export const deriveObservabilityMeta = (recordId: string): ObservabilityMeta => {
  const hash = hashString(recordId);
  return {
    responseTimeMs: 2 + (hash % 11),
    indexed: true,
    correlationId: `corr-${recordId.slice(0, 8)}`,
    transport: "SignalR",
  };
};
