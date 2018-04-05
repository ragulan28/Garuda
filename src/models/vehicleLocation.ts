export class VehicleLocation {
  constructor(public id: string,
              public longitude: number,
              public latitude: number,
              public speed: number,
              public direction: number,
              public deviceId: string,
              public time: string,
              public createdTime: string) {
  }
}
