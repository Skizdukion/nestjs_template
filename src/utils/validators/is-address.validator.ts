import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
@ValidatorConstraint({ name: 'IsValidAddress', async: true })
export class IsValidAddress implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: string) {
    const isValidAddress = ethers.utils.isAddress(value);
    return isValidAddress;
  }
}
