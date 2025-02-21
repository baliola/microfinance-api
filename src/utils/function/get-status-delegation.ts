import { StatusCreditorDelegation } from '../enum';
import { TransactionType } from '../type/type';

const statusToTransactionTypeMap: Record<
  StatusCreditorDelegation,
  TransactionType
> = {
  [StatusCreditorDelegation.NONE]: 'NONE',
  [StatusCreditorDelegation.REJECTED]: 'REJECTED',
  [StatusCreditorDelegation.APPROVED]: 'APPROVED',
  [StatusCreditorDelegation.PENDING]: 'PENDING',
};

const getStatusEnum = (
  status: bigint,
): StatusCreditorDelegation | undefined => {
  const numericStatus = Number(status);

  if (numericStatus in StatusCreditorDelegation) {
    return numericStatus as StatusCreditorDelegation;
  }

  return undefined;
};

export const getTransactionType = (
  status: bigint,
): TransactionType | undefined => {
  const statusEnum = getStatusEnum(status);
  return statusEnum !== undefined
    ? statusToTransactionTypeMap[statusEnum]
    : undefined;
};

export function convertToEnumValue(
  status: TransactionType,
): StatusCreditorDelegation {
  const reverseMap: Record<TransactionType, StatusCreditorDelegation> =
    Object.fromEntries(
      Object.entries(statusToTransactionTypeMap).map(([key, value]) => [
        value,
        Number(key),
      ]),
    ) as Record<TransactionType, StatusCreditorDelegation>;

  return reverseMap[status];
}
