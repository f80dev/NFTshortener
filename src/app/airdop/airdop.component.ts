import { Component } from '@angular/core';
import {AuthentComponent} from "../authent/authent.component";
import {CollectionSelectorComponent} from "../collection-selector/collection-selector.component";
import {GenlinkComponent} from "../genlink/genlink.component";
import {HourglassComponent} from "../hourglass/hourglass.component";
import {InputComponent} from "../input/input.component";
import {LinkComponent} from "../link/link.component";
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {NgIf} from "@angular/common";
import {ScreencutterPipe} from "../screencutter.pipe";
import {SelkeyComponent} from "../selkey/selkey.component";
import {SplashComponent} from "../splash/splash.component";
import {TokenSelectorComponent} from "../token-selector/token-selector.component";
import {TutoComponent} from "../tuto/tuto.component";
import {Collection} from "../../operation";
import {$$, now} from "../../tools";
import {NetworkService} from "../network.service";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserService} from "../user.service";
import {NgNavigatorShareService} from "ng-navigator-share";
import {StyleManagerService} from "../style-manager.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-airdop',
  standalone: true,
    imports: [
        AuthentComponent,
        CollectionSelectorComponent,
        GenlinkComponent,
        HourglassComponent,
        InputComponent,
        LinkComponent,
        MatAccordion,
        MatButton,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatIcon,
        MatTab,
        MatTabGroup,
        NgIf,
        ScreencutterPipe,
        SelkeyComponent,
        SplashComponent,
        TokenSelectorComponent,
        TutoComponent
    ],
  templateUrl: './airdop.component.html',
  styleUrl: './airdop.component.css'
})
export class AirdopComponent {
  appname="";
  visual="";
  claim="";
  background="";
  border="";
  size="";
  title="Vendre ou restreindre l'accès à un contenu";
  slide: number=0
  message="";
  airdrop:any={address:""}
  selkey: undefined;
  networks:any[]=environment.networks
  network:any=this.networks[0]

  constructor(
    public api:NetworkService,
    public dialog:MatDialog,
    public router:Router,
    public clipboard:Clipboard,
    public toast:MatSnackBar,
    public user:UserService,
    public share:NgNavigatorShareService,
    public style:StyleManagerService,
    public routes:ActivatedRoute) {
  }


  share_url(url:string) {
    let gift=this.airdrop.token.name ? this.airdrop.token.name : "NFT de la collection "+this.airdrop.collection.name
    let message="Récevez "+this.airdrop.amount+" "+gift+" a chaque visite de "+this.airdrop.redirect.substring(0,20)+" en ouvrant ce lien"
    this.share.share({
      title:message,
      url:url
    })
  }

  open_test(url:string) {
    open(url,"Test")
  }

  update_properties($event: any) {
    this.style_properties=$event;
  }

  restart() {
    $$("Reset")
    this.selkey=undefined
    this.airdrop={
      dialog_style:"color:lighrey;background-color: #53576EFF;",
      dealer_wallet:"",
      address:"",
      token:{},
      limit_by_day:5,
      limit_by_wallet:3,
      force_authent:false,
      random:100,
      amount:1,
      show_deal:true,
      redirect:"",
      authent_delay:5,
      dtStart:now("datetime",100000),
      dtEnd:now("datetime",10000000),
      network:this.networks[0].value
    };
    this.code_to_insert=""
    this.url_qrcode="";
    this.url_bank="https://tokenforge.nfluent.io/bank";
    this.owner_filter="";
  }


  select_token($event: any) {
    this.airdrop.token=$event;
    this.refresh_delay=0
    this.airdrop.unity=$event.name.substring(0,10)
    this.show_token=false
    this.show_quantity=true;
  }

  cancel() {
    this.restart()
  }

  goto_menu() {
    this.router.navigate(["menu"])
  }

  onEndSearchCollection(cols: Collection[]) {
    this.collections=cols
  }


}
