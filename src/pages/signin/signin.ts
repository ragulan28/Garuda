import {Component} from '@angular/core';
import {AlertController, LoadingController, NavController, NavParams} from 'ionic-angular';
import {UserProvider} from "../../providers/user/user";
import {NgForm} from "@angular/forms";
import {HomePage} from "../home/home";


@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public userProvider: UserProvider,
              public loder: LoadingController,
              public alertCtrl: AlertController) {
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad SigninPage');
  }


  onSignin(form: NgForm) {
    const loading = this.loder.create({
      content: "Signing....."
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
