import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class VehicleProvider {

  constructor(public http: HttpClient) {
    console.log('Hello VehicleProvider Provider');
  }


  getVehicle(userId: any) {

    return new Promise(resolve => {
      this.http.get('http://52.41.35.110:9013/bus/user/' + userId + '/vehicle')
        .subscribe(data => {
          resolve(data);
        }, err => {
          console.log("error getVehicle"+err)
        });
    });
  }


  getVehicleCurrentLocation(vehicleId: any) {
    return new Promise(resolve => {
      this.http.get('http://52.41.35.110:9013/bus/vehicle/' + vehicleId + '/locate')
        .subscribe(data => {
          resolve(data);
        }, err => {
          console.log("error getVehicleCurrentLocation"+err);
        });
    });
  }


  locationVehicle(deviceId: string, fromDate: string) {
    return new Promise(resolve => {
      this.http.get('http://52.41.35.110:9013/bus/data/' + deviceId + '/1?from=' + fromDate)
        .subscribe(data => {
          resolve(data);
        }, err => {
          console.log("error locationVehicle"+err)
        });
    });
  }

}
