import {Component, OnInit} from '@angular/core';
import {NetworkService} from "../network.service";
import {Collection, Connexion} from "../../operation";
import {NFT} from "../../nft";
import {wait_message} from "../hourglass/hourglass.component";
import {getParams, setParams, showMessage} from "../../tools";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],

})
export class CreateComponent implements OnInit {
    redirect: string = "";
    collection: Collection | undefined
    networks: string[]=["elrond-devnet","elrond-mainnet"];
    network:string=this.networks[0];
    query_collection: string = "";
    collections:Collection[]=[];
    nft: NFT | undefined
    domain="https://s.f80.fr"
    min_required=1;
    connexion: Connexion={
        address: false,
        direct_connect: false,
        email: false,
        extension_wallet: false,
        google: false,
        nfluent_wallet_connect: false,
        on_device: false,
        wallet_connect: true,
        web_wallet: false,
        webcam: false
    }
    store: string="https://xspotlight.com"
    message: string = "";
    messages={
        intro:"Veuillez vous identifier pour ouvrir le site",
        fail:"Vous devez posséder un NFT de la collection {{col}}",
    }
    url: string = "";
    style: string="background-color:white;color:black;"


    public constructor(
        public api:NetworkService,
        public routes:ActivatedRoute,
        public toast:MatSnackBar,
        public clipboard:Clipboard
    ) {
    }

    run_query($event: any) {
        wait_message(this,"Recherche des collections")
        this.api.get_collections(this.query_collection,this.network).subscribe((cols)=>{
            this.collections=cols;
            if(cols.length==0)showMessage(this,"Aucune collection pour cette recherche")
            wait_message(this)
        })
    }

    get_first_nft() {
        if(this.collection){
            if(this.store.indexOf("xspotlight")>-1){
                this.store="https://"+(this.network.indexOf("devnet")>-1 ? "devnet." : "")+"xspotlight.com/collections/"+this.collection.id;
            }
            this.api.get_nfts_from_collection(this.collection.id,this.network).subscribe((result)=>{
                if(result && result.nfts.length>0)this.nft=result.nfts[0];
            })
        }
    }

    open_gallery() {
        let prefix=this.network.indexOf("devnet")>-1 ? "devnet." : ""
        open("http://"+prefix+"xspotlight.com","search")
    }

    open_store() {
        open(this.store,"store")
    }

    create_link() {
        let body={
            redirect:this.redirect,
            connexion:this.connexion,
            messages:this.messages,
            collection:this.collection,
            required:this.min_required,
            network:this.network
        }

        this.api.create_short_link(body).subscribe((result:any)=>{
            this.url=this.domain+"/?cid="+result.cid;
            if(!this.url.startsWith("http")){
                if(this.url.indexOf("localhost")>-1){
                    this.url="http://"+this.url;
                } else {
                    this.url="https://"+this.url;
                }
            }
            this.clipboard.copy(this.url);
            showMessage(this,"Votre lien est disponible dans le presse-papier")
        })
    }

    async ngOnInit() {
        let params:any=await getParams(this.routes)
        this.network=params.networks || "elrond-devnet"
        this.redirect=params.redirect || ""
        this.domain=params.domain || "https://s.f80.fr";
        if(params.collection){
            this.query_collection=params.collection;
            this.run_query(params.collection);
        }

    }

    share_link() {

    }

    reset() {
        this.redirect="";
        this.url="";
    }

    open_link() {
        open(this.url,"Test")
    }
}
