import { BigNumber } from 'ethers';

const parseNumberToBigNumberWithBasePoint = (
  parse: number,
  basePoint = 1e18,
) => {
  return BigNumber.from(
    Math.round(parse * basePoint).toLocaleString('fullwide', {
      useGrouping: false,
    }),
  );
};

export const bigNumberMulWithNumber = (bigNumber: BigNumber, mul: number) => {
  return bigNumber
    .mul(parseNumberToBigNumberWithBasePoint(mul))
    .div(BigNumber.from(10).pow(18));
};

export const bigNumberDivWithNumber = (bigNumber: BigNumber, div: number) => {
  return bigNumber
    .div(parseNumberToBigNumberWithBasePoint(div))
    .mul(BigNumber.from(10).pow(18));
};
