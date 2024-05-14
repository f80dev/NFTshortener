import {Component, OnInit} from '@angular/core';
import {NetworkService} from "../network.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {$$, apply_params, Bank, getParams, now, setParams, showError, showMessage} from "../../tools";
import {ActivatedRoute, Router} from "@angular/router";
import {Location, NgFor, NgIf} from "@angular/common";
import {PaymentTransaction} from "../payment/payment.component";
import {_ask_for_paiement} from "../ask-for-payment/ask-for-payment.component";
import {UserService} from "../user.service";
import {MatDialog} from "@angular/material/dialog";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {RECAPTCHA_SETTINGS, RECAPTCHA_V3_SITE_KEY, RecaptchaModule, RecaptchaSettings} from "ng-recaptcha";
import {MatIcon} from "@angular/material/icon";
import {AuthentComponent} from "../authent/authent.component";
import {AutovalidatorComponent} from "../autovalidator/autovalidator.component";

const RECAPTCHA_V2_DUMMY_KEY="6LdX9J4pAAAAABf_KZ1nwaXySHtQAGqeszNYwq4q"
const RECAPTCHA_V3_STACKBLITZ_KEY="6LfvRp8pAAAAACODbLsrMxtR54meVPiL2ZUvwOYX"
const SITEKEY_V2="6Lcqr20UAAAAABiUyOK8i2AD52Gvg81YrsJdvxSV"
//voir https://www.google.com/recaptcha/admin/site/342732586?hl=fr

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    MatIcon,
    HourglassComponent,
    AuthentComponent, NgIf, NgFor,
    AutovalidatorComponent, RecaptchaModule
  ],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: SITEKEY_V2,
      } as RecaptchaSettings,
    },
  ],
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  url_to_redirect: string="";
  config:any={identity:false,style:"",messages:{intro_message:"",fail:"Accès impossible, vous n'avez pas le NFT requis"},collection: null,store:""};
  validator_id="valid_"+now("rand")
  final_message="";
  message="";
  provider: any;
  address: string=""
  network_name:any={"elrond-devnet":"de test MvX (devnet)","elrond-mainnet":"MultiversX"}
  sitekey=SITEKEY_V2

  public constructor(
      public api:NetworkService,
      public _location:Location,
      public toast:MatSnackBar,
      public clipboard:Clipboard,
      public dialog:MatDialog,
      public routes:ActivatedRoute,
      public router:Router,
      public user:UserService
  ) {
  }

  analyse_params(r:any) : any {
    //Analyse des paramètres

    r.style=r.style || "background-color:gray;"
    r.price=r.price || Number(r.quantity) || 0
    r.network=r.network || "elrond-devnet"
    if(!r.hasOwnProperty("messages"))r.messages={intro:r.message,success:"",fail:""}
    r.messages["success"]=r.messages["success"] || "Redirection dans quelques secondes"
    r.messages["fail"]=r.messages["fail"] || "Impossible de continuer"
    if(!r.messages.intro)r.messages.intro=r.message


    apply_params(this,r)
    if(r.service=="landing_page"){
      const delay=Number(r.quantity)*60 || 1000
      showMessage(this,"Redirection dans "+delay.toString()+" secondes")
      setTimeout(()=>{
        location.href=r.target || r.redirect
      },delay*1000)
    }

    if(r.hasOwnProperty("airdrop") || r.service=="airdrop"){
      if(r.airdrop.force_authent){
        this.address=""
      }else{
        this.address=localStorage.getItem("airdrop_address") || ""
        this.transfert_fund(this.address)
      }
    }

    if(r.service=="poh"){
      r.messages=r.messages || {intro:"Vous êtes bien un humain ?"}
    }

    if (!r.merchant && r.service == 'token_gate') {
      r.messages=r.messages || {intro:"l'accès à ce site est payant"}
      this.api.get_token(r.token, r.network).subscribe({
        next: (token: any) => {
          r.merchant = {
            wallet: {
              address: r.address,
              token: r.token,
              network: r.network,
              unity: token.unity
            }
          }
        }
      })

      for (let k of Object.keys(r.messages)) {
        if (r.merchant && r.merchant!.wallet!.unity) r.messages[k] = r.messages[k].replace("__coin__", r.merchant.wallet.unity)
        if (r.collection) r.messages[k] = r.messages[k].replace("__collection__", r.collection.name)
      }
      if (!r.collection && r.price == 0) {
        this.authent(r.redirect);
      }

    }


    return(r)
  }

  async ngOnInit() {

      let r:any=await getParams(this.routes);
      $$("Lecture des paramétres ",r)
      this.config=this.analyse_params(r)
      if(r.hasOwnProperty("target")){
        this.url_to_redirect=r.target+""
      }else{
        this.url_to_redirect=r.redirect+""
      }

      let sep=this.url_to_redirect.indexOf("?")>-1 ? "&" : "?"
      this.url_to_redirect=this.url_to_redirect+sep+setParams({ts: now()})

    $$("URL de redirection ",this.url_to_redirect)
  }


  fail($event: string) {
    this.final_message=this.config.messages.fail;
  }

  authent($event: any) {
    this.final_message=this.config.messages.success
    if(this.config.service=="airdrop"){
      //TODO Demander la creation du clam
      //TODO Signer la transaction et l'executer

    }

    if(this.config.price>0){
      this.config.collection=null;
      $$("on annule la question de la collection puisque c'est ok")
    }

      showMessage(this,"Vous allez être redirigé automatiquement")
      setTimeout(()=>{this.redirect()},2000)

  }

  redirect() {
    if(!this.url_to_redirect.startsWith("http"))this.url_to_redirect="https://"+this.url_to_redirect;
    window.location["href"]=this.url_to_redirect
  }

  close_form() {
    this._location.back()
    showMessage(this,"Vous pouvez fermer cette fenêtre")
  }

  open_buy() {
    open(this.config.store,"store")
  }

  open_collection() {
    let url="https://"+(this.config.network.indexOf("devnet")>-1 ? "devnet." : "")+"xspotlight.com/collections/"+this.config.collection.id;
    open(url,"collection")
  }

  paid(transac: PaymentTransaction) {
    this.authent(this.url_to_redirect);
  }

  async ask_paid() {
    let bill_content:any={}
    let rc=await _ask_for_paiement(this,
        this.config.merchant.wallet.token,
        this.config.price,0,
        this.config.merchant,
        this.user.wallet_provider,
        "Payer "+this.config.price+" "+this.config.merchant.wallet.unity,
        "Indiquer votre wallet de paiement","","",
        bill_content,
        "crypto");
    if(rc){
      this.authent(this.url_to_redirect);
    }
  }


  airdrop_authent($event: { strong: boolean; address: string; provider: any }) {
    this.transfert_fund($event.address);
  }

  transfert_fund(address: string | null) {
    if(!address)return false;
    let bank:Bank={
      histo: "",
      limit: this.config.airdrop.limit_by_day,
      wallet_limit:this.config.airdrop.limit_by_wallet,
      miner: this.config.airdrop.dealer_wallet,
      network: this.config.network,
      refund: this.config.airdrop.amount,
      title: "",
      token: this.config.airdrop.token || "",
      collection: this.config.airdrop.collection ? (this.config.airdrop.collection.id || "") : ""
    }
    wait_message(this,"Récompense en cours de transfert. Redirection vers "+this.url_to_redirect.replace("https://","")+" imminente")
    setTimeout(()=>{this.redirect();},4000);
    localStorage.setItem("airdrop_address",address)
    this.api.refund(bank,address).subscribe((r:any)=>{
      wait_message(this)
      let name=this.config.airdrop.collection.label ? "NFT de la collection "+this.config.airdrop.collection.label : this.config.airdrop.token
      showMessage(this,"Vous avez été crédité de "+this.config.airdrop.amount+" "+name)
      },(err)=>{wait_message(this);showError(this,err)})
    return true;
  }

  clear_cookie() {
    localStorage.removeItem("airdrop_address")
  }

  onError($event: []) {
    showMessage(this,"Désolé vous n'êtes pas un humain")
  }
}
