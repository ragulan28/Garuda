import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { UserProvider } from '../providers/user/user';
import { VehicleProvider } from '../providers/vehicle/vehicle';
import {SigninPage} from "../pages/signin/signin";
import {TrackingPage} from "../pages/tracking/tracking";
import {MqttModule, MqttService, MqttServiceOptions} from "ngx-mqtt";
import {HttpClientModule} from "@angular/common/http";


export const MQTT_SERVICE_OPTIONS: MqttServiceOptions = {
  hostname: 'mmqtt.senzmate.com',
  port: 8000,
  username: 'sammy',
  password: 'sammy@SenzMate',

};


export function mqttServiceFactory() {
  return new MqttService(MQTT_SERVICE_OPTIONS);
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SigninPage,
    TrackingPage
  ],


  imports: [
    BrowserModule,
    HttpClientModule,
    MqttModule.forRoot({
      provide: MqttService,
      useFactory: mqttServiceFactory
    }),
    IonicModule.forRoot(MyApp,{
      pageTransition: "md-transition"
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SigninPage,
    TrackingPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    UserProvider,
    VehicleProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
