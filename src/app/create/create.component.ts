import {Component, OnInit} from '@angular/core';
import {NetworkService} from "../network.service";
import {Collection, Connexion, get_default_connexion} from "../../operation";
import {NFT} from "../../nft";
import {wait_message} from "../hourglass/hourglass.component";
import {
  $$,
  apply_params, encrypt,
  get_images_from_banks,
  getParams,
  isURL,
  showError,
  showMessage
} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {StyleManagerService} from "../style-manager.service";
import {NgNavigatorShareService} from "ng-navigator-share";
import {UserService} from "../user.service";
import {Merchant} from "../payment/payment.component";
import {_prompt} from "../prompt/prompt.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],

})
export class CreateComponent implements OnInit {
  redirect: string = "";
  gate_server: string = "";
  token_filter="";
  collection: Collection | undefined
  networks: any[]=[]
  network:{label:string,value:string}={label:"",value:""}
  query_collection: string = "";
  collections:Collection[]=[];
  nft: NFT | null=null;
  domain=environment.appli;
  min_required=1;
  connexion: Connexion=get_default_connexion()
  store: string=""
  message: string = "";
  messages={
    intro:"L'accès a ce contenu est limité",
    fail:"Impossible de continuez sans le NFT ou le paiement requis",
    success:"Eligibilité vérifiée. Vous pouvez rejoindre le site"
  }
  final_message="";
  url: string = "";

  background_image: string="";
  border: string="2px"
  filter_by_wallet: boolean = true;
  size: string="98%"
  showAccessRequiredSection: boolean=true;
  token: any;

  local_save(){
    localStorage.setItem("query_collection",this.query_collection)
    localStorage.setItem("token",this.token)
  }

  public constructor(
    public api:NetworkService,
    public routes:ActivatedRoute,
    public toast:MatSnackBar,
    public clipboard:Clipboard,
    public style:StyleManagerService,
    public router:Router,
    public dialog:MatDialog,
    public user:UserService,
    public ngShare:NgNavigatorShareService
  ) {
    this.user.addr_change.subscribe(()=>{
      this.collections=[]
      for(let c of this.user.collections){

      }
    })
  }



  // get_first_nft() {
  //   if(this.collection){
  //     if(this.store.indexOf("xspotlight")>-1){
  //       this.store="https://"+(this.network.value.indexOf("devnet")>-1 ? "devnet." : "")+"xspotlight.com/collections/"+this.collection.id;
  //     }
  //     wait_message(this,"Chargement du premier NFT")
  //     this.api.get_nfts_from_collection(this.collection.id,this.network.value).subscribe((result)=>{
  //       wait_message(this)
  //       if(result && result.nfts.length>0){
  //         this.nft=result.nfts[0];
  //       }else {
  //         this.nft = null;
  //         showMessage(this,"Cette collection ne contient aucun NFT")
  //       }
  //     })
  //   }
  // }

  //explorer.multiversx.com/collections/
  show_login: boolean=false;
  dialog_style: string="color:white;background-color: #53576EFF;"
  appname: string=environment.appname;
  version=environment.version

  price: number = 1;
  required: { nft: boolean, payment: boolean } = {nft:false,payment:false};
  bank: string = "";
  url_qrcode: string = "";
  show_scanner: boolean=false;
  desc: string = "";
  marketplaces=[
    {label:"XNOXNO",value:"https://xoxno.com/collection/{{collection}}"},
    {label:"FrameIt",value:"https://www.frameit.gg/marketplace/{{collection}}/items"},
    {label:"xSpotLight",value:"https://xspotlight.com/collections/{{collection}}"},
    {label:"Autres",value:""},
  ]
  address: string="";

  open_gallery(collection_id:string,main="xspotlight.com/collections/{{col}}") {
    let prefix=this.network.value.indexOf("devnet")>-1 ? "devnet." : ""
    let url="https://"+prefix+main.replace("{{col}}",collection_id)
    open(url,"search")
  }

  open_store() {
    open(this.store,"store")
  }

  is_valide_URL(url:string){
    return isURL(url)
  }




  async create_link(as_service=false) {
    let wallet:any={address:this.address,token:"",unity:"",network:this.network.value}

    if(this.required.payment){
      if(!this.token || this.price==0 || wallet.address==""){
        showMessage(this,"Le token de paiement, le prix ou l'adresse de réception des paiements n'est pas valide");return;
      }
      wallet.unity=this.token.name
      wallet.token=this.token.identifier
    }
    if(this.required.nft){
      if(!this.collection){
        showMessage(this,"Vous devez sélectionner une collection non vide");return;
      }
    }

    let merchant: Merchant={contact: "", country: "", currency: "", id: "", name: "", wallet:wallet};

    $$("Préparation du message")
    this.desc=(this.required.nft || this.required.payment) ? "Autoriser l'acces " : "Raccourcir le lien d'accès ";
    this.desc=this.desc+"au contenu "+this.redirect;
    if(this.required.nft)this.desc=this.desc+" aux possesseurs d'un NFT de la collection "+this.collection!.name;
    if(this.required.payment)this.desc=this.desc+" après réglement de "+this.price+" "+this.token.name

    if(this.background_image!=''){
      this.dialog_style=this.dialog_style+"background-image:url('"+this.background_image+"');background-size:cover;"
    }

    let body:any={
      redirect:this.redirect,
      connexion:this.connexion,
      messages:this.messages,
      required:this.min_required,
      network:this.network.value,
      service:"TokenGate",
      store:this.store,
      style:this.dialog_style,
      bank:this.bank,
      price:this.required.payment ? this.price : 1
    }
    if(this.required.payment){
      body["merchant"]=merchant;
    }else{
      if(this.collection)body["collection"]={id:this.collection["id"],name:this.collection["name"]}
    }


    if(as_service){
      let service=await _prompt(this,"Nom du service",this.appname,"","text","Confirmer","Annnuler",false)

      //TODO: a terminer
      if(service){
        let description=await _prompt(this,"Description du service",this.title,"","text","Confirmer","Annnuler",false)
        if(description){
          let body_service={
            service:service,
            url:body,
            description:description
          }
          $$("Ajout du service ",body)
          this.api._post(environment.shorter_service+"/api/services/","",body_service)
        }
      }else{
        return
      }
    }else{
      let r=await _prompt(this,"Confirmation de création du lien","",this.desc,"oui/non","Fabriquer","Annuler")
      if(r!="yes")return;

      let url="https://"+this.gate_server+"/?p="+encrypt(JSON.stringify(body))

      this.api.create_short_link({url:url}).subscribe({next:(result:any)=>{
          // if(!this.required.nft && !this.required.payment){
          //   url_domain=
          // } else {
          //   url_domain=(url_domain+"?").replace("/?","?")
          // }
          //Si pas de collection, le lien renvoi directement a l'api

          this.url=environment.shorter_service+"/"+result.cid;
          if(!this.url.startsWith("http")){
            if(this.url.indexOf("localhost")>-1){
              this.url="http://"+this.url;
            } else {
              this.url="https://"+this.url;
            }
          }
          this.clipboard.copy(this.url);
          this.api.qrcode(this.url,"json").subscribe((r:any)=>{
            this.url_qrcode=r.qrcode;
          })

          showMessage(this,"Votre lien est disponible dans le presse-papier")
        },
        error:(err)=>{
        showError(this,err)
      }})
    }




  }

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    apply_params(this,params,environment);

    this.networks=params.networks ? params.networks.split(",").map((x:any)=>{return({label:x,value:x})}) : environment.networks
    if(params.network){
      let result=this.networks.filter(item => item.value==params.network)
      if(result.length>0){
        this.networks=result;
        this.network=result[0]
      }
    } else {
      this.network=this.networks[0];
    }

    this.bank=params.bank || ""
    this.redirect=params.redirect || ""
    this.gate_server=params.gate_server || environment.gate_server || "gate.nfluent.io"
    this.required.payment=(params.required=="payment" || params.required=="token")
    this.required.nft=(params.required=="nft")
    this.address=params.address || ""

    this.query_collection=params.query || params.collection || localStorage.getItem("query_collection") || "";
    this.domain=params.domain || environment.appli;
    this.update_token(params.token || environment.token || "")
    this.price=params.price || 0;
  }

  share_link() {
    this.ngShare.share({
      title:this.messages.intro,
      text:"",
      url:this.url
    })
  }

  async reset() {
    let rep=await _prompt(this,"Effacer le travail actuel","","","oui/non","Effacer","Conserver")
    if(rep=="yes"){
      this.redirect="";
      this.url="";
      this.desc="";
      this.required={nft:false,payment:false};
    }
  }

  open_link() {
    open(this.url,"Test")
  }

  // async paste_url() {
  //     let obj:any=navigator.clipboard;
  //     let url=await obj.readText();
  //     if(url.startsWith("http")){
  //         this.redirect=url;
  //     }else{
  //         showMessage(this,"Le presse papier ne contient pas de lien web")
  //     }
  // }
  show_nft_store: boolean=false;
  show_content=true;
  show_test_wallet: boolean=false;
  title="Limiter l'accès ou valoriser un contenu";
  intro: any;
  visual=environment.visual
  claim=environment.claim
  slide: number=1
  show_access_condition=false;
  background: string=""


  open_about() {
    this.router.navigate(["about"]);
  }



  switch_mode() {
    this.user.advance_mode=!this.user.advance_mode;
  }

  async authent(connect: { strong: boolean; address: string; provider: any }) {
    this.show_login=false;
    this.show_access_condition=true;
    let result:any=await this.user.init(connect.address,this.network.value,true)
    this.address=connect.address;
    this.token_filter=connect.address;
    this.showAccessRequiredSection=true;
  }


  upload_file($event: any) {
    wait_message(this,"Chargement du fichier");
    this.api.upload($event).subscribe((r:any)=>{
      this.redirect=r.url;
      wait_message(this)
    })
  }

  show_esdt() {

  }

  select_collection(c:any){
    this.collection=c;
  }

  update_token(token: any) {
    if(typeof(token)=="string"){
      this.api.find_tokens(this.network.value,token,true,1).subscribe((r)=> {
        if(r.length>0){
          this.token = r[0];
        }
      })
    } else {
      this.token=token;
      if(token.url)this.bank=token.url;
    }

    // this.merchant.wallet!.token=token_id;
    // if(token_id.length>10){
    //     this.api.get_token(token_id,this.network).subscribe((r)=>{
    //         this.token=r;
    //     },(err)=>{
    //         this.token=null;
    //     })
    // }
  }



  async create_account() {
    let email=await _prompt(this,"Création d'un wallet pour recevoir les paiements","","Indiquer votre adresse email","text","Créer le wallet","Annuler",false)
    this.api.create_account(this.network.value,email).subscribe((r:any)=>{
      this.address=r.address
      this.filter_by_wallet=false
      this.token_filter=""
      this.token=undefined
      showMessage(this,"Consulter votre mail pour récupérer les informations de votre nouveau wallet",10000)
    })
  }

  open_wallet() {
    if(this.address.length>10){
      let url="https://explorer.multiversx.com/accounts/"+this.address+"/tokens";
      if(this.network.value.indexOf("devnet")){
        url=url.replace("explorer","devnet-explorer");
      }
      open(url,"explorer")
    }
  }

  scan_wallet($event: any){
    this.address=$event.data
    this.token_filter=this.address
    this.show_scanner=false
  }


  update_marketplace($event: any) {
    if($event!=""){
      this.store=$event.replace("{{collection}}",this.collection!.id)
      if(this.network.value.indexOf("devnet")>-1 && this.store.indexOf("spotlight")>-1)this.store=this.store.replace("https://","https://devnet.")
    }
  }

  token_filter_by_account(new_value:any) {
    this.token_filter=new_value ? this.address : ""
  }

  set_public_wallet($event: any) {
    this.address=$event.address
    this.token_filter=this.address
  }

  on_cancel() {
    this.show_test_wallet=false
  }

  async find_images() {
    let images=await get_images_from_banks(this,this.api,"background",false,1)
    if(images.length>0){
      this.background_image=images[0].image
    }
  }
}
