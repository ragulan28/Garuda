import {Component} from '@angular/core';
import {LoadingController, NavController} from 'ionic-angular';
import {GoogleMap, GoogleMaps, GoogleMapsEvent} from "@ionic-native/google-maps";
import {VehicleProvider} from "../../providers/vehicle/vehicle";
import {VehicleLocation} from "../../models/vehicleLocation";
import {TrackingPage} from "../tracking/tracking";
import {Vehicle} from "../../models/vehicle";
import {AndroidFullScreen} from "@ionic-native/android-full-screen";


const CAMERA_DEFAULT_LAT = 6.974159;
const CAMERA_DEFAULT_LONG = 79.9166422;
const CAMERA_DEFAULT_ZOOMLEVEL = 15;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  mapReady: boolean = false;
  map: GoogleMap = null;
  firstLoad: boolean = true;


  constructor(public navCtrl: NavController,
              private vehicleProvider: VehicleProvider,
              private androidFullScreen: AndroidFullScreen,
              public loader: LoadingController) {

  }


  ionViewDidLoad() {
    this.androidFullScreen.isImmersiveModeSupported()
      .then(() => this.androidFullScreen.immersiveMode())
      .catch((error: any) => console.log(error));
    console.log('HomePage: ionViewDidLoad');
    this.loadMap();
  }


  loadMap() {

    console.log('HomePage: loadMap()');
    this.map = GoogleMaps.create('map_canvas', {
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
      console.log('HomePage: map is ready...');
      this.getVehicle('Depot-Kili')

    });

  }


  ionViewWillLeave() {
    console.log('HomePage: ionViewWillLeave()');
    this.map.setDiv(null);
  }


  ionViewDidEnter() {
    console.log('HomePage: ionViewDidEnter()');
    if (!this.firstLoad) {
      this.map.setDiv('map_canvas');
    } else {
      this.firstLoad = false;
    }
  }


  openSecondPage(location: VehicleLocation, id: string) {
    console.log('HomePage: openSecondPage()' + id);
    this.navCtrl.push(TrackingPage, {location: location, id: id});
  }


  getUserLocation() {
    console.log('HomePage: getUserLocation()');
    try {
      this.map.getMyLocation().then((result) => {
          console.log(JSON.stringify(result));
        },
        (err) => {
          console.log(JSON.stringify(err));
        }
      );

    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }


  addMarker(location: VehicleLocation, id: string) {

    this.map.addMarker({
        icon: 'assets/imgs/bus.png',
        animation: 'DROP',
        position: {
          lat: location.latitude,
          lng: location.longitude
        }
      })
      .then(marker => {
        marker.on(GoogleMapsEvent.MARKER_CLICK)
          .subscribe(() => {
            this.openSecondPage(location, id);
          });
      });

  }


  getVehicle(userId: string) {
    const loading = this.loader.create({
      content: "Loading ..."
    });
    loading.present();
    this.vehicleProvider.getVehicle(userId)
      .then(data => {
        let vehicles = data['content'];
        if (vehicles['length'] > 0) {
          this.addMakers(vehicles);
        } else {
          loading.dismiss();
          alert("No vehicles right now!");
        }
      });
    loading.dismiss();
  }


  addMakers(vehicle: Vehicle[]) {

    for (let i = 0; i < vehicle.length; i++) {
      this.getVehicleLocation(vehicle[i].id);

    }

  }


  getVehicleLocation(id: string) {
    this.vehicleProvider.getVehicleCurrentLocation(id)
      .then(data => {
        let location: VehicleLocation = data['content'];
        this.addMarker(location, id);
        let d = {lat: location.latitude, lng: location.longitude};
        this.map.animateCamera({
          'target': d,
          'tilt': 0,   // ignored
          'zoom': CAMERA_DEFAULT_ZOOMLEVEL,   // ignored
          'bearing': 0, // ignored
          'duration': 2000
        });
      });
  }


}
