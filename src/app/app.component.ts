import { Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {environment} from "../environments/environment";
import {create_manifest_for_webapp_install, getParams} from "../tools";
import {UserService} from "./user.service";

declare const gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = environment.appname;
  constructor(
      public router:Router,
      public routes:ActivatedRoute,
      public user:UserService
  ) {
    this.router.events.subscribe((event) => {
      //TODO: a retablir aprés modification du conde
      // if (event instanceof NavigationEnd) {
      //   gtag('config', 'G-EJXLHTBQS1', { 'page_path': event.urlAfterRedirects });
      // }
    })
  }


  async ngAfterContentInit() {


  }

  async ngOnInit() {
    setTimeout(async ()=>{
      let params:any=await getParams(this.routes)
      let body:any={name: params["appname"] || environment.appname, theme_color: "#1976d2", background_color: "#fafafa"}
      create_manifest_for_webapp_install(body,window.document,"assets/icons/nflux-%%.png","64,128,256,512")
      this.user.params=params;
    },200)

  }
}
