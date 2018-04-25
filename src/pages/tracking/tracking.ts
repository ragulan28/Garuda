import {Component} from '@angular/core';
import {LoadingController, NavController, NavParams} from 'ionic-angular';
import {VehicleLocation} from "../../models/vehicleLocation";
import {MqttMessage, MqttService} from "ngx-mqtt";
import {GoogleMap, GoogleMaps, GoogleMapsEvent} from "@ionic-native/google-maps";
import {VehicleProvider} from "../../providers/vehicle/vehicle";
import {AndroidFullScreen} from "@ionic-native/android-full-screen";

const CAMERA_DEFAULT_LAT = 6.974159;
const CAMERA_DEFAULT_LONG = 79.9166422;
const CAMERA_DEFAULT_ZOOMLEVEL = 10;

@Component({
  selector: 'page-tracking',
  templateUrl: 'tracking.html',
})
export class TrackingPage {
  mapReady: boolean = false;
  map: GoogleMap;
  dateFrom: string;
  deviceId: string;
  parameter: VehicleLocation;
  id: string;
  private currentDate: string;
  busCoordinates = [];


  constructor(public navCtrl: NavController,
              public vehicleProvider: VehicleProvider,
              public navParams: NavParams,
              public loader: LoadingController,
              private _mqttService: MqttService,private androidFullScreen: AndroidFullScreen) {
    this.parameter = this.navParams.get('location');

  }


  ionViewDidEnter() {
    this.androidFullScreen.isImmersiveModeSupported()
      .then(() => this.androidFullScreen.immersiveMode())
      .catch((error: any) => console.log(error));
    this.currentDate = new Date().toISOString().substring(0, 10);
    this.dateFrom = this.currentDate;
    this.deviceId = this.parameter.deviceId;
    this.id = this.navParams.get('id');
    this.loadMap();

  }


  loadMap() {
    console.log('SecondPage: loadMap()');
    this.map = GoogleMaps.create('map_second', {
      'mapType': 'MAP_TYPE_NORMAL',
      'controls': {
        'compass': true,
        'myLocationButton': false,
        'indoorPicker': false,
        'zoom': true
      },
      'gestures': {
        'scroll': true,
        'tilt': false,
        'rotate': true,
        'zoom': true
      },
      'styles': [
        {
          featureType: "all",
          stylers: [
            {saturation: -80}
          ]
        },
        {
          featureType: "poi.business",
          elementType: "labels",
          stylers: [
            {visibility: "off"}
          ]
        }
      ],
      'camera': {
        target: {
          lat: CAMERA_DEFAULT_LAT,
          lng: CAMERA_DEFAULT_LONG
        },
        zoom: CAMERA_DEFAULT_ZOOMLEVEL
      },
      'preferences': {
        'zoom': {
          'minZoom': 2,
          'maxZoom': 20
        },
        'building': false
      }
    });

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.mapReady = true;
      console.log('SecondPage: map is ready...');
      this.locationVehicle(this.deviceId, this.dateFrom);
      let url = 'SenzMate/S2A/' + this.deviceId;
      // let url = 'SenzMate/#';
      console.log(url);
      this._mqttService
        .observe(url)
        .subscribe((message: MqttMessage) => {
          let location: VehicleLocation = JSON.parse(message.payload.toString());
          console.log("add maker in correct data");
          console.log(url);
          console.log(location);
          if (this.currentDate == this.dateFrom) {
            this.addMarker(location, 'current', true);
            let l = {lat: location.latitude, lng: location.longitude};
            this.busCoordinates.push(l);
            this.addMarker(this.busCoordinates[0], 'start', false);
            this.drawPolyLine(this.busCoordinates, '#161616',)
          }
        });
      console.log(this.deviceId);
    });

  }


  ionViewWillLeave() {
    console.log('SecondPage: ionViewWillLeave()');
    this.busCoordinates = [];
    this.map.destroy();
  }


  locationVehicle(deviceId: string, fromDate: string) {
    const loading = this.loader.create({
      content: "Drawing ..."
    });
    loading.present();
    this.vehicleProvider.locationVehicle(deviceId, fromDate)
      .then(data => {
        let locations = data['content'];
        if (locations['length'] > 0) {
          this.collectPolyLineData(locations);
          loading.dismiss();
        }else {
          loading.dismiss();
          alert("No data in this Data!");
        }
      });

  }


  collectPolyLineData(locations: VehicleLocation[]) {
    for (var i = 0; i < locations.length; i++) {
      let location = {lat: locations[i].latitude, lng: locations[i].longitude};
      this.busCoordinates.push(location);
    }
    if (this.dateFrom == this.currentDate) {
      console.log("current");
      this.addMarker(locations[(locations.length - 1)], 'current', true);
    } else {
      console.log("end");
      this.addMarker(locations[(locations.length - 1)], 'end', true);
    }

    this.addMarker(locations[0], 'start', false);

    this.drawPolyLine(this.busCoordinates, '#161616');
  }


  private drawPolyLine(busCoordinates, color) {

    this.map.addPolyline({
      points: busCoordinates,
      'color': color,
      'width': 2,
      'geodesic': true
    });

    this.map.animateCamera({
      'target': busCoordinates,
      'tilt': 0,   // ignored
      'zoom': 18,   // ignored
      'bearing': 0, // ignored
      'duration': 2000
    });

  }


  dateChanged(date: string) {
    console.log('Data Changed');

    this.map.clear();
    this.busCoordinates = [];
    this.locationVehicle(this.deviceId, date);
  }


  addMarker(location: VehicleLocation, icon: string, IsClear: boolean) {
    console.log('add Maker');
    if (IsClear) {
      this.map.clear();
    }
    //let l = {lat: location.latitude, lng: location.longitude};
    //this.currentLocation.push(l);
    this.map.addMarker({
      icon: 'assets/imgs/' + icon + '.png',
      position: {
        lat: location.latitude,
        lng: location.longitude
      }
    }).then(marker => {
      marker.on(GoogleMapsEvent.MARKER_CLICK)
        .subscribe(() => {
          alert(location.createdTime);
        });
    });

  }

}
