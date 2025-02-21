type RegexPattern = Record<'walletPattern', RegExp>;

export const regexPattern: RegexPattern = {
  walletPattern: /^0x[a-fA-F0-9]{40}$/,
};
