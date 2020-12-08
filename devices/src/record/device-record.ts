import { RecordPersistor, Services } from '@thelarsson/acss-common';

export class DeviceRecord extends RecordPersistor {
  protected service: Services = Services.devices;
}
