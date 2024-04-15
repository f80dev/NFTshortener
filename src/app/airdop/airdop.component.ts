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
import {NgFor, NgIf} from "@angular/common";
import {ScreencutterPipe} from "../screencutter.pipe";
import {SelkeyComponent} from "../selkey/selkey.component";
import {SplashComponent} from "../splash/splash.component";
import {TokenSelectorComponent} from "../token-selector/token-selector.component";
import {TutoComponent} from "../tuto/tuto.component";
import {Collection, Connexion, emptyCollection, get_default_connexion} from "../../operation";
import {
  $$,
  apply_params,
  CryptoKey,
  get_images_from_banks,
  getParams,
  now, parseFrenchDate,
  setParams,
  showError,
  showMessage
} from "../../tools";
import {NetworkService} from "../network.service";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {CdkCopyToClipboard, Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserService} from "../user.service";
import {NgNavigatorShareService} from "ng-navigator-share";
import {StyleManagerService} from "../style-manager.service";
import {environment} from "../../environments/environment";
import {UploadFileComponent} from "../upload-file/upload-file.component";

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
    CdkCopyToClipboard,
    MatButton,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatIcon,
    MatTab,
    MatTabGroup,
    NgIf,NgFor,
    ScreencutterPipe,
    SelkeyComponent,
    SplashComponent,
    TokenSelectorComponent,
    TutoComponent,
    UploadFileComponent
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
  airdrop:any={dealer_wallet:"",token:{},claimers:[],marge:0.1}
  selkey: undefined;
  networks:any[]=environment.networks
  network:any=this.networks[0]
  query_collection=""

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
  show_quantity: boolean=false
  collections: Collection[]=[]
  show_token: boolean=true;
  background_image="";
  link_properties:any[]=[
    {label: "Fond d'écran",value:"https://s.f80.fr/assets/wood.jpg",name:"background",width:"350px"},
    {label: "FavIcon",value:"favicon.png",name:"favicon",width:"350px"},
    {label: "Splash Screen",value:"https://nfluent.io/assets/cash_machine.jpg",name:"visual",width:"350px"},
    {label: "Claim",value:"",name:"claim",width:"350px",help:"Phrase affiché en haut de la fenêtre"},
    {label: "Style",value:"nfluent-dark.css",name:"style",width:"350px"},
  ]
  balances: any[]=[]
  balance: number = 0;

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

  async ngOnInit() {
    this.restart()
    let params:any=await getParams(this.routes)
    apply_params(this,params,environment)
    if(params.wallet){
      this.airdrop.dealer_wallet=params.wallet
      this.network={value:params.network || "elrond-devnet"}
    }
    if(this.airdrop.dealer_wallet.length>0){
      this.find_address_from_encrypt()
    }else{
      this.airdrop.dealer_wallet=params.address || ""
    }
    this.update_total(this.to_send_airdrop);
  }



  find_address_from_encrypt(){
    this.api.get_account(this.airdrop.dealer_wallet,this.airdrop.network).subscribe((r:any[])=>{
      if(r.length>0){
        this.airdrop.dealer_wallet=r[0].encrypted
        $$("Récupération de l'adresse du wallet de distribution "+this.airdrop.dealer_wallet)
      }else{
        showError(this)
      }
    })
  }


  update_authent($event: any) {
    this.airdrop.force_authent=$event
  }


  onEndSearchCollection(cols: Collection[]) {
    this.collections=cols
  }


  modify() {
    this.short_url=''
    this.redirect=""
  }


  onEndSearch($event: any[]) {
    this.balances=$event
    if($event.length==0){
      //showMessage(this,"Aucune monnaie trouvée dans ce wallet");
      this.show_token=true
      this.api.qrcode(this.airdrop.dealer_wallet,"json").subscribe((r:any)=>{this.qrcode_wallet=r.qrcode;})
    }
  }


  select_collection($event: Collection) {
    this.collection=$event;
  }


  add_affiliate_link() {
    this.api._post("affiliated_links/","",{url:this.affiliate_url,airdrop:this.airdrop}).subscribe({
      next:(r:any)=>{
        if(r.message=="ok")
          showMessage(this,"Votre lien est enregistré")
        else
          showMessage(this,r.message)
      },
      error:(err)=>{
        showError(this,err)
      }
    })
  }


  save_airdrop() {

    if(this.background_image!=''){
      this.airdrop.dialog_style="background-image:url('"+this.background_image+"');background-size:cover;"
    }

    debugger
    this.airdrop.dtStart=parseFrenchDate(this.range.split(" - ")[0])!.getMilliseconds()/1000
    this.airdrop.dtStart=parseFrenchDate(this.range.split(" - ")[1])!.getMilliseconds()/1000


    $$("Enregistrement des parametres de l'airdrop",this.airdrop)
    // if(this.airdrop.amount>this.airdrop.limit_by_day){
    //   showMessage(this,"Le montant doit être inférieur a la limite");return;
    // }
    localStorage.setItem("airdrop",JSON.stringify(this.airdrop))
    wait_message(this,"Construction en cours")
    this.api._post("airdrop_fund/","from_domain="+environment.appli,this.airdrop).subscribe({
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
    this.owner_filter=$event.address;
    this.airdrop.provider=$event.provider;
    this.airdrop.dealer_wallet=$event.address;
    this.update_dealer_balances()
  }


  async update_dealer_balances(){
    return new Promise((resolve, reject) => {
      this.api.find_tokens(this.airdrop.network,this.airdrop.dealer_wallet,"",false).subscribe({
        next:(r:any)=> {
          this.balances=r;

          resolve(r)
        }
      })
    });
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
      token:{},
      marge:0.1,
      claimers:[],
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
    this.airdrop.unity=$event.name.substring(0,10)
    this.show_token=false
    this.show_quantity=true;
    for(let token of this.balances){
      if(token.identifier==$event.identifier){
        this.balance=token.balance;
      }
    }

  }

  cancel() {
    this.restart()
  }

  goto_menu() {
    this.router.navigate(["menu"])
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

  protected readonly emptyCollection = emptyCollection;
  intro=6;
  claimer_addresses: string="";
  to_send_airdrop: number=1;
  show_addresses: boolean = false;
  range=now("text")+" - "+now("text",10000000);
  hour="00:00"

  upload_addresses($event: any) {
    let sep="\n"
    this.airdrop.claimers = []
    this.airdrop.total=0;
    let content = $event.file;
    if (content) {
      if (content.indexOf("base64,")>-1) {
        content = content.split("base64,")[1]
        content = atob(content)
        sep="\r\n"
      }
    }

    for (let r of content.split(sep)) {
      if(r.startsWith("erd")){
        this.airdrop.claimers.push(r);
        this.airdrop.total=this.airdrop.total+this.airdrop.amount;
      }
    }

    this.airdrop.total=this.airdrop.total+(this.airdrop.marge/100)*this.airdrop.total;

  }

  update_total($event: any) {
    this.to_send_airdrop=Number($event);
    this.airdrop.total=this.to_send_airdrop+this.to_send_airdrop*this.airdrop.marge/100;
  }
}
