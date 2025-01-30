import { Injectable } from '@nestjs/common';
import { IDebtorService } from './util/debtor.service.interface';

@Injectable()
export class DebtorService implements IDebtorService {
  async getLogActivity(nik: string): Promise<void> {}

  async registration(nik: string): Promise<void> {}
}
