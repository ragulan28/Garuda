import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController, NavParams} from 'ionic-angular';
import {UserProvider} from "../../providers/user/user";
import {NgForm} from "@angular/forms";
import {HomePage} from "../home/home";
import {AndroidFullScreen} from "@ionic-native/android-full-screen";


@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public userProvider: UserProvider,
              public loader: LoadingController,
              public alertCtrl: AlertController,private androidFullScreen: AndroidFullScreen) {
  }


  ionViewDidLoad() {
    this.androidFullScreen.isImmersiveModeSupported()
      .then(() => this.androidFullScreen.immersiveMode())
      .catch((error: any) => console.log(error));
    console.log('ionViewDidLoad SigninPage');
  }


  onSignin(form: NgForm) {
    const loading = this.loader.create({
      content: "Signing ..."
    });
    loading.present();
    this.userProvider.sigin(form.value.username, form.value.password)
      .then(data => {
        let location = data;
        loading.dismiss();
        if (location['statusCode'] == 'S1000') {
          this.navCtrl.setRoot(HomePage);
        } else {
          const alert = this.alertCtrl.create({
            title: 'Signing Fail',
            message: location['statusDescription'],
            buttons: ['Ok']
          });
          alert.present();
        }
      });
  }

}
