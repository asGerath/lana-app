import CryptoJS from 'crypto-js';

type GenerateTaskIdParams = {
  userId: string;
  title: string;
};

export const generateTaskId = ({
  userId,
  title,
}: GenerateTaskIdParams): string => {
  const timestamp = Date.now().toString();
  const rawValue = `${userId}-${title}-${timestamp}`;
  const hash = CryptoJS.SHA256(rawValue).toString(CryptoJS.enc.Hex).slice(0, 10);

  return `task-${userId}-${timestamp}-${hash}`;
};