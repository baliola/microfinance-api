import { IsApprove } from 'src/model/creditor/util/creditor-type.service';
import { TransactionResponseType } from '../type/type';

const isApproveToTransactionTypeMap: Record<
  IsApprove,
  TransactionResponseType
> = {
  [IsApprove.REJECTED]: 'REJECTED',
  [IsApprove.APPROVED]: 'APPROVED',
};

/**
 * Converts a numeric value into TransactionResponseType.
 */
export const getTransactionResponseType = (
  status: number | bigint,
): TransactionResponseType | undefined => {
  const numericStatus = Number(status); // Ensure conversion from BigInt

  return isApproveToTransactionTypeMap[numericStatus as IsApprove];
};
