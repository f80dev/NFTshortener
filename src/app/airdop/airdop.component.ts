import { Component } from '@angular/core';
import {AuthentComponent} from "../authent/authent.component";
import {CollectionSelectorComponent} from "../collection-selector/collection-selector.component";
import {GenlinkComponent} from "../genlink/genlink.component";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
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
import {Collection, Connexion, emptyCollection, get_default_connexion} from "../../operation";
import {$$, CryptoKey, get_images_from_banks, now, setParams, showError, showMessage} from "../../tools";
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
  code_to_insert: string="";
  title="Vendre ou restreindre l'accès à un contenu";
  slide: number=0
  message="";
  airdrop:any={address:""}
  selkey: undefined;
  networks:any[]=environment.networks
  network:any=this.networks[0]

  style_properties: any={}

  owner_filter="";      //Utiliser pour spécifier si les monnaie recherché doivent se limiter à un wallet ou tous
  connexion:Connexion=get_default_connexion()
  qrcode_wallet: string = "";
  affiliate_url: string = "https://nfluent.io";
  redirect: string = "https://nfluent.io";
  redirect_message="Soyez récompenser en suivant ce lien"
  short_url:string="";
  url_qrcode="";
  authent:Connexion=get_default_connexion()
  url_bank: string="https://tokenforge.nfluent.io/bank"
  handle:any;
  collection: Collection=emptyCollection()
  refresh_delay: number=10        //Temps de rafraichissement sur les tokens du wallet
  show_quantity: boolean=false
  collections: Collection[]=[]
  show_token: boolean=false;
  background_image="";
  link_properties:any[]=[
    {label: "Fond d'écran",value:"https://s.f80.fr/assets/wood.jpg",name:"background",width:"350px"},
    {label: "FavIcon",value:"favicon.png",name:"favicon",width:"350px"},
    {label: "Splash Screen",value:"https://nfluent.io/assets/cash_machine.jpg",name:"visual",width:"350px"},
    {label: "Claim",value:"",name:"claim",width:"350px",help:"Phrase affiché en haut de la fenêtre"},
    {label: "Style",value:"nfluent-dark.css",name:"style",width:"350px"},
  ]

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

  save_airdrop() {

    if(this.background_image!=''){
      this.airdrop.dialog_style="background-image:url('"+this.background_image+"');background-size:cover;"
    }

    $$("Enregistrement des parametres de l'airdrop",this.airdrop)
    if(this.airdrop.amount>this.airdrop.limit_by_day){
      showMessage(this,"Le montant doit être inférieur a la limite");return;
    }
    localStorage.setItem("airdrop",JSON.stringify(this.airdrop))
    wait_message(this,"Construction en cours")
    this.api._post("airdrops/","from_domain="+environment.appli,this.airdrop).subscribe({
      next:(r:any)=>{
        wait_message(this)
        if(r.code){
          this.code_to_insert=r.code

          $$("Evaluation du lien internet")
          if(this.link_properties){
            let params=r.params
            for(let p of Object.keys(this.style_properties)){
              params[p]=this.style_properties[p]
            }
            params["bank.histo"]=environment.histo
            params["appname"]=this.airdrop.unity+" Bank"
            params["toolbar"]=false
            params["background"]="https://nftlive.nfluent.io/assets/wood.jpg"
            params["style"]="nfluent-dark.css"
            $$("Utilisation des parametres ",params)
            //http://bank.nfluent.io/?p=YmFuay5oaXN0bz1kYi0tbmZsdWVudCZiYW5rLmxpbWl0PTUmYmFuay5taW5lcj1aMEZCUVVGQlFtdHVSREpqTFdNM01UZFROelZPTVVSd1RUUTFiR0kxTFdoNFp6WnliV0V4TjFkR1NYZGZVM0phWjJ4R1p6VlZlVEJPWVVoU1QzQjBiVUZWTUZGMlRsRTJWazVhTVhsNWVuSkVXak0zZEdFNU1YVlJRVEI0VkdwRlZWRTlQUSUzRCUzRCZiYW5rLm5ldHdvcms9ZWxyb25kLWRldm5ldCZiYW5rLnJlZnVuZD0xJmJhbmsudG9rZW49YjY0JTNBZXlKaFkyTnZkVzUwY3lJNk1qY3NJbUpoYkdGdVkyVWlPakFzSW1OaGJrRmtaRk53WldOcFlXeFNiMnhsY3lJNmRISjFaU3dpWTJGdVFuVnliaUk2ZEhKMVpTd2lZMkZ1UTJoaGJtZGxUM2R1WlhJaU9uUnlkV1VzSW1OaGJrWnlaV1Y2WlNJNmRISjFaU3dpWTJGdVRXbHVkQ0k2ZEhKMVpTd2lZMkZ1VUdGMWMyVWlPblJ5ZFdVc0ltTmhibFZ3WjNKaFpHVWlPblJ5ZFdVc0ltTmhibGRwY0dVaU9uUnlkV1VzSW1SbFkybHRZV3h6SWpveE9Dd2laR1Z6WTNKcGNHbHZiaUk2SWlJc0ltbGtJam9pVGtaTVZVTlBTVTR0TkRreU1XVmtJaXdpYVdSbGJuUnBabWxsY2lJNklrNUdURlZEVDBsT0xUUTVNakZsWkNJc0ltbHRZV2RsSWpvaWFIUjBjSE02THk5MGIydGxibVp2Y21kbExtNW1iSFZsYm5RdWFXOHZZWE56WlhSekwybGpiMjV6TDJWbmJHUXRkRzlyWlc0dGJHOW5ieTUzWldKd0lpd2lhWE5RWVhWelpXUWlPbVpoYkhObExDSnNZV0psYkNJNklrNUdiSFZEYjJsdUlpd2libUZ0WlNJNklrNUdiSFZEYjJsdUlpd2liM2R1WlhJaU9pSmxjbVF4WjJ0a05tWTRkMjAzT1hZelpuTjVlV3RzY0RKeGEyaHhNR1ZsYXpJNFkyNXlOR3BvYWpsb09EZDZkM0Y0ZDJSNk4zVjNjM1JrZW1vemJTSXNJblJwWTJ0bGNpSTZJazVHVEZWRFQwbE9MVFE1TWpGbFpDSXNJblJ5WVc1ellXTjBhVzl1Y3lJNk1qSTVMQ0owZVhCbElqb2lSblZ1WjJsaWJHVkZVMFJVSW4wJTNEJnN0eWxlPW5mbHVlbnQtZGFyay5jc3MmYmFja2dyb3VuZD1odHRwcyUzQSUyRiUyRnMuZjgwLmZyJTJGYXNzZXRzJTJGd29vZC5qcGcmZmF2aWNvbj1mYXZpY29uLnBuZyZ2aXN1YWw9aHR0cHMlM0ElMkYlMkZuZmx1ZW50LmlvJTJGYXNzZXRzJTJGY2FzaF9tYWNoaW5lLmpwZyZjbGFpbT0mdG9vbGJhcj1mYWxzZSZhcHBuYW1lPU5GbHVDb2luJTIwQmFuaw%3D%3D
            if(this.airdrop.token.id){
              this.airdrop.redirect=this.url_bank+"/?"+setParams(params);
            }else{
              this.airdrop.redirect=this.url_bank.replace("bank","candymachine")+"/?"+setParams(params);
            }

          }
        }else{
          showMessage(this,r.message)
        }

      },
      error:(err:any)=>{
        wait_message(this)
        showError(this,err)
      }
    })
  }

  async find_images() {
    let images=await get_images_from_banks(this,this.api,"background",false,1)
    if(images.length>0){
      this.background_image=images[0].image
    }
  }


  on_authent($event: { strong: boolean; address: string; provider: any ,encrypted:string}) {
    this.airdrop.address=$event.address;
    this.airdrop.dealer_wallet=$event.encrypted
    this.owner_filter=$event.address;
    this.update_dealer_balances()
  }

  onEndSearchCollection(cols: Collection[]) {
    this.collections=cols
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

  update_network($event: any) {
    this.network=$event
    this.airdrop.network=$event.value;
  }

  switch_mode() {
    this.user.advance_mode=!this.user.advance_mode
  }

  start_with_collection() {
    if(this.collection){
      this.airdrop.collection=this.collection
      this.airdrop.unity=this.collection.name
      this.show_quantity=true
      this.airdrop.limit_by_day=1
      this.airdrop.limit_by_wallet=1
      this.airdrop.unity="NFT"
    }
  }

  eval_redirect() {
    this.connexion.google=this.connexion.email
    this.connexion.webcam=this.connexion.email
    this.connexion.address=this.connexion.email
    let body:any={
      url:environment.gate_server,
      redirect:this.redirect,
      connexion:this.connexion,
      messages:this.redirect_message,
      network:this.network.value,
      airdrop:this.airdrop,
      service:"AirDrop"
    }

    this.api.create_short_link(body).subscribe({next:(result:any)=>{
        $$("Fabrication du lien avec serveur de redirection sur "+environment.gate_server)
        this.short_url=environment.shorter_service+"?"+result.cid;

        this.clipboard.copy(this.short_url);
        this.api.qrcode(this.short_url,"json").subscribe((r:any)=>{
          this.url_qrcode=r.qrcode;
        })

        showMessage(this,"Votre lien est disponible dans le presse-papier")
      },error:(err)=>{showError(this,err)}})
  }


}
