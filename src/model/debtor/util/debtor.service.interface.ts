export interface IDebtorService {
  getLogActivity(nik: string): Promise<void>;
  registration(nik: string): Promise<void>;
}
