import {Component, OnInit} from '@angular/core';
import {NetworkService} from "../network.service";
import {Collection, Connexion} from "../../operation";
import {NFT} from "../../nft";
import {wait_message} from "../hourglass/hourglass.component";
import {$$, apply_params, getParams, setParams, showError, showMessage} from "../../tools";
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
    collection: Collection | undefined
    networks: any[]=[]
    network:any;
    query_collection: string = "";
    collections:Collection[]=[];
    nft: NFT | null=null;
    domain=environment.appli;
    min_required=1;
    connexion: Connexion={
        address: false, keystore: false,
        direct_connect: false,
        email: false,
        extension_wallet: true,
        google: false,
        nfluent_wallet_connect: false,
        on_device: false,
        wallet_connect: true,
        web_wallet: false,
        webcam: false
    }
    store: string=""
    message: string = "";
    messages={
        intro:"L'accès a ce contenu est limité",
        fail:"Impossible de continuez sans le NFT ou le paiement requis",
        success:"Eligibilité vérifiée. Vous pouvez rejoindre le site"
    }
    final_message="";
    url: string = "";

    appname: string=environment.appname;
    visual: string=environment.visual;
    claim: string = environment.claim;
    background: string="";
    border: string="2px"
    size: string="98%"
    showAccessRequiredSection: boolean=true;
    token: any;

    local_save(){
        localStorage.setItem("redirect",this.redirect);
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

    run_query($event: any,limit=300) {
        this.nft=null;
        if(!this.query_collection || this.query_collection==""){
            this.collections=[];
            return;
        }
        wait_message(this,"Recherche des collections")
        this.api.get_collections(this.query_collection,this.network.value,false,limit).subscribe((cols)=>{
            this.collections=cols;
            if(cols.length==0){
                showMessage(this,"Aucune collection pour cette recherche")
            } else {
                this.collection=this.collections[0];
            }
            if(cols.length==limit)showMessage(this,"Il manque probablement des réponses")
            wait_message(this)
        })
    }

    get_first_nft() {
        if(this.collection){
            if(this.store.indexOf("xspotlight")>-1){
                this.store="https://"+(this.network.value.indexOf("devnet")>-1 ? "devnet." : "")+"xspotlight.com/collections/"+this.collection.id;
            }
            wait_message(this,"Chargement du premier NFT")
            this.api.get_nfts_from_collection(this.collection.id,this.network.value).subscribe((result)=>{
                wait_message(this)
                if(result && result.nfts.length>0){
                    this.nft=result.nfts[0];
                }else {
                    this.nft = null;
                    showMessage(this,"Cette collection ne contient aucun NFT")
                }
            })
        }
    }

    //explorer.multiversx.com/collections/
    show_login: boolean=false;
    dialog_style: string="color:white;background-color: #53576EFF;"

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

    open_gallery(main="xspotlight.com/collections/{{col}}") {
        let prefix=this.network.indexOf("devnet")>-1 ? "devnet." : ""
        let url="https://"+prefix+main.replace("{{col}}",this.query_collection)
        open(url,"search")
    }

    open_store() {
        open(this.store,"store")
    }



    async create_link() {
        let wallet:any={address:this.address,token:"",unity:"",network:this.network.value}

        if(this.required.payment){
            if(!this.token || this.price==0 || wallet.address==""){
                showMessage(this,"Le token de paiement, le prix ou l'adresse de réception des paiements n'est pas valide");return;
            }
            wallet.unity=this.token.name
            wallet.token=this.token.identifier
        }
        if(this.required.nft){
            if(!this.collection || !this.nft){
                showMessage(this,"Vous devez sélectionner une collection non vide");return;
            }
        }

        let merchant: Merchant={contact: "", country: "", currency: "", id: "", name: "", wallet:wallet};

        $$("Préparation du message")
        this.desc=(this.required.nft || this.required.payment) ? "Autoriser l'acces " : "Raccourcir le lien d'accès ";
        this.desc=this.desc+"au contenu "+this.redirect;
        if(this.required.nft)this.desc=this.desc+" aux possesseurs d'un NFT de la collection "+this.collection!.name;
        if(this.required.payment)this.desc=this.desc+" après réglement de "+this.price+" "+this.token.name

        let r=await _prompt(this,"Confirmation de création du lien","",this.desc,"oui/non","Fabriquer","Annuler")
        if(r!="yes")return;


        let body:any={
            redirect:this.redirect,
            connexion:this.connexion,
            messages:this.messages,
            required:this.min_required,
            network:this.network.value,
            store:this.store,
            style:this.dialog_style,
            bank:this.bank,
            price:this.required.payment ? this.price : 0
        }
        if(this.required.payment){
            body["merchant"]=merchant;
        }else{
            if(this.collection)body["collection"]={id:this.collection["id"],name:this.collection["name"]}
        }


        let url_domain=this.domain

        this.api.create_short_link(body).subscribe({next:(result:any)=>{
            if(!this.required.nft && !this.required.payment){
                url_domain=environment.server+"/api/sl/"
            } else {
                url_domain=(url_domain+"?").replace("/?","?")
            }//Si pas de collection, le lien renvoi directement a l'api

            this.url=url_domain+result.cid;
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
        },error:(err)=>{showError(this,err)}})
    }

    async ngOnInit() {
        let params:any=await getParams(this.routes)
        apply_params(this,params,environment);

        this.networks=(params.networks || environment.networks).split(",").map((x:any)=>{return({label:x,value:x})});
        this.network=this.networks[0];

        this.bank=params.bank || environment.default_bank || ""
        this.redirect=params.redirect ||  localStorage.getItem("redirect") || ""
        this.required.payment=(params.required=="payment")
        this.required.nft=(params.required=="nft")

        this.query_collection=params.query || params.collection || localStorage.getItem("query_collection") || "";
        this.domain=params.domain || environment.appli;
        this.update_token(params.token || "NFLUCOIN-4921ed")
        this.price=params.price || 0;
        if(this.query_collection!='' && this.required.nft){
            this.run_query(this.query_collection);
            this.showAccessRequiredSection=true;
        }
    }

    share_link() {
        this.ngShare.share({
            title:this.messages.intro,
            text:"",
            url:this.url
        })
    }

    reset() {
        this.redirect="";
        this.url="";
        this.desc="";
        this.required={nft:false,payment:false};
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

    open_about() {
        this.router.navigate(["about"]);
    }



    switch_mode() {
        this.user.advance_mode=!this.user.advance_mode;
    }

    async authent(connect: { strong: boolean; address: string; provider: any }) {
        this.show_login=false;
        if(connect.strong){
            let result:any=await this.user.init(connect.address,this.network.value,true)
            if(this.address=='')this.address=connect.address;
            if(this.required.nft && this.query_collection==''){
                this.query_collection=connect.address;
                this.run_query(connect.address);
            }
            this.showAccessRequiredSection=true;
        }
    }

    show_my_collection() {

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

    open_create_esdt() {
        showMessage(this,"Depuis le wallet web, choisir la rubrique Create Token puis reporter l'identifiant dans "+this.appname,6000,()=>{
            open("https://wallet.multiversx.com/issue-token","wallet")
        },"Ouvrir le wallet")
    }

    async create_account() {
        let email=await _prompt(this,"Création d'un wallet","","Indiquer votre adresse email","text","Créer le wallet","Annuler",false)
        this.api.create_account(this.network.value,email).subscribe((r:any)=>{
            this.address=r.address;
            showMessage(this,"Consulter votre mail pour récupérer les informations de votre nouveau wallet",10000)
        })
    }

    open_wallet() {
        let url="https://explorer.multiversx.com/accounts/"+this.address+"/tokens";
        if(this.network.value.indexOf("devnet"))url=url.replace("explorer","devnet-explorer");
        open(url,"explorer")
    }

    scan_wallet($event: any) {
        this.address=$event.data
        this.show_scanner=false;
    }

    open_search_esdt() {

    }

    update_marketplace($event: any) {
        if($event!=""){
            this.store=$event.replace("{{collection}}",this.collection!.id)
            if(this.network.value.indexOf("devnet")>-1 && this.store.indexOf("spotlight")>-1)this.store=this.store.replace("https://","https://devnet.")
        }
    }
}
