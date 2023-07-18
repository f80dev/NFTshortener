import {Component, OnInit} from '@angular/core';
import {NetworkService} from "../network.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {$$, Bank, getParams, now, setParams, showError, showMessage} from "../../tools";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {PaymentTransaction} from "../payment/payment.component";
import {_ask_for_paiement} from "../ask-for-payment/ask-for-payment.component";
import {UserService} from "../user.service";
import {MatDialog} from "@angular/material/dialog";
import {Connexion} from "../../operation";
import {wait_message} from "../hourglass/hourglass.component";

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  url: string="";
  show_message: string="";
  config:any={style:"",messages:{intro_message:"",fail:"Accès impossible, vous n'avez pas le NFT requis"},collection:"",store:""};
  validator_id="valid_"+now("rand")
  final_message="";
  message="";
  provider: any;
  authentification: Connexion | undefined;


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

  async ngOnInit() {
    let params:any=await getParams(this.routes);
    let cid=params.cid;
    if(!cid){
      let url=this.router.url
      if(url.indexOf("?")>-1)cid=url.split("?")[1]
    }
    if(!cid || cid.length>10){
      this.router.navigate(["create"],{queryParams:params})
    }else{
      cid=cid.split("=")[0]
      this.api._get("sl/"+cid).subscribe((r:any)=>{
        r.style=r.style || "background:none"
        r.price=r.price || 0
        this.config=r;

        if(r.hasOwnProperty("airdrop")){
          this.config.connexion=r.connexion
          this.config.messages.intro_message=r.messages;
          this.config.airdrop=r.airdrop
          this.url=r.redirect
          this.config.network=r.network;
          this.transfert_fund(!r.airdrop.force_authent ? localStorage.getItem("airdrop_address") : null)
        }else{
          for(let k of Object.keys(this.config.messages)){
            if(this.config.merchant!.wallet!.unity)this.config.messages[k]=this.config.messages[k].replace("__coin__",this.config.merchant.wallet.unity)
            if(this.config.collection)this.config.messages[k]=this.config.messages[k].replace("__collection__",this.config.collection.name)
          }
          if(!r.collection && r.price==0){
            this.authent(r.redirect);
          }
        }

      },(err)=>{
        showError(this,err);
      })
    }
  }


  fail($event: string) {
    this.final_message=this.config.messages.fail.replace("{{col}}",this.config.collection.name);
  }

  authent($event: any) {
    this.final_message=this.config.messages.success
    if(this.config.price>0){
      this.config.collection=null;
      $$("on annule la question de la collection puisque c'est ok")
    }
    if(this.config.redirect){
      this.url = this.config.redirect + (this.config.redirect.indexOf("?") > -1 ? "&" : "?") + setParams({ts: now()})
    }
  }

  redirect() {
    if(!this.url.startsWith("http"))this.url="https://"+this.url;
    window.location["href"]=this.url
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
    this.authent(this.config.redirect);
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
      this.authent(this.config.redirect);
    }
  }

  open_bank() {
    open(this.config!.bank,"bank")
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
      token: this.config.airdrop.token.identifier
    }
    wait_message(this,"Récompense en cours de transfert. Redirection vers "+this.url.replace("https://","")+" imminente")
    setTimeout(()=>{this.redirect();},4000);
    localStorage.setItem("airdrop_address",address)
    this.api.refund(bank,address).subscribe((r:any)=>{
      wait_message(this)
      showMessage(this,"Vous avez été crédité de "+this.config.airdrop.amount+" "+this.config.airdrop.token.name)
      },(err)=>{wait_message(this);showError(this,err)})
    return true;
  }

  clear_cookie() {
    localStorage.removeItem("airdrop_address")
  }
}
