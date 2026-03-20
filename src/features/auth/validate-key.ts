type ValidateKeyParams = {
  key: string;
  timestamp: string;
};

export const validateDynamicKey = ({
  key,
  timestamp,
}: ValidateKeyParams): boolean => {
  const now = Date.now();
  const keyTime = Number(timestamp);

  // Expira en 10 segundos
  const isValidTime = now - keyTime < 10000;

  return Boolean(key && isValidTime);
};