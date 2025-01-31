import { LogActivityType } from '../../debtor/util/debtor-type.service';
import { RegistrationServiceType } from './debtor-type.service';

export interface IDebtorService {
  getLogActivity(nik: string): Promise<LogActivityType>;
  registration(nik: string): Promise<RegistrationServiceType>;
}
