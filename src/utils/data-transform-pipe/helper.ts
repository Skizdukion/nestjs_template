import { TransformFnParams } from 'class-transformer';

export function trimAndLowercaseStringArray(params: TransformFnParams) {
  const trimStringArray: string[] = [];
  params.value.forEach((item) => {
    trimStringArray.push(item.trim().toLowerCase());
  });
  return trimStringArray;
}
