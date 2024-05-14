//Test : http://localhost:4200/?wallet=Z0FBQUFBQmtzQ21wT3BtSXo1ODg2QUI4MHZyY3NTeTljRHVzTlJkOG9XbV9DeHpKOU9GY1F0YzRjeTRCVFBPMm5SZzBvUXhTcTF5NDFIMC1BZURvdmxZcXJmTjFOYUxvdFBNX0VMQ1hvVTdlZ1REUFY4UHdKd215XzZucXlrbGFJRllXZXE0UFU4VEc5SDd0WG5pWDdyMUFyLWl3ajlPZTZiZ0VHY0o2V2JtelJ3NTlDVjQ5YmZKZy1NV2R0WFF4V0VmUkRlMzMtWlVrSDYxZ3JnTUhwUXdmcjRaRXRBTzFfV0FtN0Rqc3MzQ3huaWUzenBOY3Y0WWpfSm4tRDQ5TTlDbFhwTVNFMzFVQVRrWmc2WG5qT2ZLRy1xekY0UXpUY3k4aXVJVlViTDRrbHlIeFhFVkM2TDlwVkVLVzB3eDZQUlRhQXM2YktBbnVudElTNExWVS0xVmxvckRMTXp5cFNnM2J3WFlDdXJZRndRSk9EOFphUUU4QlBzWE5oUGtBcGw5ejM5MEVTQmtDdktnWWRsS1FBNmw1MjFzVVhiZHNfZ01RMzFXUWRtbUh0ZFk0X3lKUXRNNC04ckNhbzlGNG9QTHJNaWhKUXQ5Y01ZcUgxN3l5Vm9nWmVOdzJBemFsS21XcmE2Z0doNm1rLVZZX0w1WUdKQ0x1OHkzTlJOWkZwb3ZxY3pEN3JfU0FrMGs3eVlDVWNCWmZSQzJjaTloNlhmR055VmsxbFZlNlg1MEl2cmxLb1p0YXJpZG5WbnpESkFWNzNKQVNPVkZmYm5OT2N4UE5yQWZQVVpia2JJYm5BMXlMTlJVNXFydzFpSWYySXlaN1lFeHhuT2tOWGFlUkJROVVMZmkyWGxVenVVdVdzcG5LelB2dXVhTUZ3RDVLV2c9PQ

import {Component} from '@angular/core';
import {
  $$,
  apply_params,
  getParams,
  CryptoKey,
  now,
  setParams,
  showError,
  showMessage,
  get_images_from_banks
} from "../../tools";
import {NetworkService} from "../network.service";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {StyleManagerService} from "../style-manager.service";
import {NgNavigatorShareService} from "ng-navigator-share";
import {_prompt} from "../prompt/prompt.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserService} from "../user.service";
import {Collection, Connexion, emptyCollection, get_default_connexion} from "../../operation";
import {Clipboard} from "@angular/cdk/clipboard";
import {wait_message} from "../hourglass/hourglass.component";

@Component({
  selector: 'app-plugin',
  templateUrl: './plugin.component.html',
  styleUrls: ['./plugin.component.css']
})
export class PluginComponent {
  airdrop:any={address:""}
  code_to_insert: string="";
  networks:any[]=environment.networks
  network:any=this.networks[0]
  owner_filter="";      //Utiliser pour spécifier si les monnaie recherché doivent se limiter à un wallet ou tous
  appname="";
  visual="";
  claim="";
  background="";
  border="";
  size="";
  title="Vendre ou restreindre l'accès à un contenu";

  link_properties:any[]=[
    {label: "Fond d'écran",value:"https://s.f80.fr/assets/wood.jpg",name:"background",width:"350px"},
    {label: "FavIcon",value:"favicon.png",name:"favicon",width:"350px"},
    {label: "Splash Screen",value:"https://nfluent.io/assets/cash_machine.jpg",name:"visual",width:"350px"},
    {label: "Claim",value:"",name:"claim",width:"350px",help:"Phrase affiché en haut de la fenêtre"},
    {label: "Style",value:"nfluent-dark.css",name:"style",width:"350px"},
  ]
  style_properties: any={}
  authent:Connexion=get_default_connexion()

  connexion:Connexion=get_default_connexion()
  qrcode_wallet: string = "";
  affiliate_url: string = "https://nfluent.io";
  redirect: string = "https://nfluent.io";
  redirect_message="Soyez récompenser en suivant ce lien"
  short_url:string="";
  url_qrcode="";

  url_bank: string="https://tokenforge.nfluent.io/bank"
  handle:any;
  selkey: CryptoKey | undefined;
  balances: any[]=[]
  collection: Collection=emptyCollection()
  refresh_delay: number=10        //Temps de rafraichissement sur les tokens du wallet
  show_quantity: boolean=false
  collections: Collection[]=[]

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



  find_address_from_encrypt(){
    this.api.get_account(this.airdrop.dealer_wallet,this.airdrop.network).subscribe((r:any[])=>{
      if(r.length>0){
        this.airdrop.dealer_wallet=r[0].encrypted
        this.airdrop.address=r[0].address
        $$("Récupération de l'adresse du wallet de distribution "+this.airdrop.address)
      }else{
        showError(this)
      }
    })
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
      this.airdrop.address=params.address || ""
    }

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

  async create_account() {
    let email=await _prompt(this,"Création d'un wallet dédié à l'opération","","Indiquer votre adresse email pour recevoir les paramètres du wallet","text","Créer le wallet","Annuler",false)
    wait_message(this,"Création du wallet dédié")
    this.api.create_account(this.airdrop.network,email,"mail_new_account","mail_existing_account",{},true).subscribe(async (r:any)=>{
      wait_message(this)
      await _prompt(this,"Votre nouveau wallet est disponible","",
        "Les informations du wallet sont disponibles dans votre mail. Il faut lui envoyer les cryptos ou les NFT que vous souhaitez distribuer",
        "oui/non","Ok","")

      this.airdrop.address=r.address;
      this.owner_filter="";
      this.refresh_delay=10;
      this.api.qrcode(this.airdrop.address,"json").subscribe((r:any)=>{
        this.qrcode_wallet=r.qrcode;
      })
      this.airdrop.dealer_wallet=r.encrypted;
      this.update_dealer_balances()

      showMessage(this,"Consulter votre mail pour récupérer les informations de votre nouveau wallet",10000)
    })
  }

  update_network($event: any) {
    this.network=$event
    this.airdrop.network=$event.value;
  }

  switch_mode() {
    this.user.advance_mode=!this.user.advance_mode
  }

  // async encrypt_key(secret_key="") {
  //   if(secret_key==""){
  //     secret_key=await _prompt(this,"La clé privée du wallet de distribution","",this.appname+" à besoin de la clé privée pour pouvoir distribuer les tokens","text","Valider","Annuler",false)
  //   }
  //   if(secret_key){
  //     if(secret_key.length<15 && this.airdrop.network.indexOf("devnet")>-1){
  //       $$("On recherche la clé au pseudo ",secret_key)
  //       this.api._get("keys/"+secret_key+"/","network="+this.airdrop.network).subscribe({
  //         next:(keys:any[])=>{this.airdrop.dealer_wallet=secret_key+": "+keys[0].encrypted,this.airdrop.address=keys[0].address;},
  //         error:(err)=>{debugger;showError(this,err)}
  //       })
  //     }
  //   } else {
  //     this.api.encrypte_key("wallet",this.airdrop.network,secret_key).subscribe(
  //         {
  //           next:(code:string)=>{debugger;this.airdrop.dealer_wallet=code},
  //           error:(err)=>{debugger;showError(this,err)}
  //         }
  //     )
  //   }
  // }


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



  onEndSearch($event: any[]) {
    this.balances=$event
    if($event.length==0){
      //showMessage(this,"Aucune monnaie trouvée dans ce wallet");
      this.show_token=true
      this.api.qrcode(this.airdrop.address,"json").subscribe((r:any)=>{this.qrcode_wallet=r.qrcode;})
    }
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

  async dealer_wallet_validate(){
    if(this.airdrop.dealer_wallet==""){
      this.restart();
    }else{
      await this.find_address_from_encrypt()
      await this.update_dealer_balances();
    }
  }

  update_dealer_wallet($event: any) {
    this.airdrop.dealer_wallet=$event
    if($event.length>20)this.dealer_wallet_validate();
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


  set_public_wallet(k: CryptoKey) {
    this.selkey=k
    this.airdrop.dealer_wallet=k.address;
    this.update_dealer_balances()
  }

  use_selkey(){
    if(this.selkey){
      this.airdrop.dealer_wallet=this.selkey?.encrypt;
      this.airdrop.address=this.selkey?.address;
      this.owner_filter=this.airdrop.address;
      this.dealer_wallet_validate();
    }
  }

  // async keystore_upload($event:any) {
  //   let password=await _prompt(this,"Mot de passe associé","","","text","Ok","Annuler",false)
  //   this.api.encrypte_key("",this.network.value,"","").subscribe({
  //     next:(r:any)=>{
  //       this.airdrop.dealer_wallet=r.encrypt
  //       this.airdrop.address=r.address;
  //     }
  //   })
  // }
  query_collection=""
  show_token: boolean = true;
  intro=2000
  message=""
  slide: number=1;
  background_image="";

  update_authent($event: any) {
    this.airdrop.force_authent=$event
  }


  modify() {
    this.short_url=''
    this.redirect=""
  }

  async find_images() {
    let images=await get_images_from_banks(this,_prompt,this.api,"background",false,1)
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

  select_collection($event: Collection) {
    this.collection=$event;
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

  protected readonly emptyCollection = emptyCollection;

}
