import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {$$, CryptoKey, showError, showMessage} from "../../tools";
import {NetworkService} from "../network.service";
import {Collection} from "../../operation";
import {NFT} from "../../nft";
import {wait_message} from "../hourglass/hourglass.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {_prompt} from "../prompt/prompt.component";
import {WalletProvider} from "@multiversx/sdk-web-wallet-provider/out";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-collection-selector',
  templateUrl: './collection-selector.component.html',
  styleUrls: ['./collection-selector.component.css']
})
export class CollectionSelectorComponent implements OnChanges,OnDestroy {
  @Input("collection") sel_collection: Collection | undefined
  collections: Collection[] = []
  message = ""
  @Output("selected") onselect: EventEmitter<Collection> = new EventEmitter();
  @Output() endSearch: EventEmitter<Collection[]> = new EventEmitter();
  @Input() owner = ""
  @Input("create_collection") miner_or_validator:CryptoKey | WalletProvider | undefined
  @Input() network = ""
  @Input() roles = "canTransfer"
  @Input() limit = 300
  @Input() refresh_delay = 0
  @Input() color = "white"
  @Input() w_image = "200px"
  @Input() min_supply = 1
  @Input() animation = "crossfade"
  @Input("query") query_collection = "";
  @Input() title = "Sélectionnez une collection";
  @Input() showSearchWithoutOwner: boolean = false;
  @Input() w_image_selected:string=""

  handle: any = 0;
  nfts: NFT[] = [];
  delay_showroom=1;
  background:string=""

  constructor(public api: NetworkService,
              public dialog:MatDialog,
              public toast: MatSnackBar) {

  }

  find_visual(col: Collection) {
    this.api.get_nfts_from_collection(col.id, this.network, this.min_supply, false).subscribe({
      next: (result: any) => {
        if (result.nfts && result.nfts.length >= this.min_supply) {
          col.cover = result.nfts[0].visual
        } else {
          col.cover = "https://media.tenor.com/oQS5OZ9xuGkAAAAM/box-2k.gif" //provoque la disparition du NFT
        }
      },
      error: (err) => {
        showError(this, err)
      }
    })
  }


  refresh_collections(owner="",filter=""){
      if(owner=="")owner=filter;
      this.api.get_collections(owner, this.network, true, this.limit, this.roles).subscribe((r: any) => {
        this.message = ""
        this.collections = []
        for (let col of r) {
          col.label = col.name
          if (col.roles) {
            for (let r of col.roles) {
              delete r.roles
            }
            if(filter=="" || col.name.indexOf(filter)>-1){
              this.collections.push(col)
            }
          }
          if (this.w_image != ''){
            this.find_visual(col);
          }
        }
        if (this.collections.length == 0) showMessage(this, "Aucune collection pour cet utilisateur")
        if (this.collections.length == 1 && !this.miner_or_validator) {
          $$("Une seule sélection donc on sélectionne "+this.collections[0].name)
          this.select_collection(this.collections[0])
        }

      }, (error: any) => {
        this.api.wait()
        showError(this, error)
      })

  }

  refresh() {
    if (this.handle != 0) {
      $$("Arret de la récupératon")
      clearInterval(this.handle)
      this.handle = 0
    }else{
      this.refresh_collections(this.owner,this.query_collection)
      if(this.refresh_delay>0){
        $$("Mise en place d'une collecte des NFTs toutes les " + this.refresh_delay + " secondes")
        this.handle = setInterval(() => {this.refresh_collections(this.owner,this.query_collection)}, this.refresh_delay * 1000);
      }
    }



  }

  ngOnDestroy() {
    if (this.handle != 0) clearInterval(this.handle)
    this.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.w_image_selected=="")this.w_image_selected=this.w_image;
    setTimeout(()=>{this.refresh()},500)
  }


  select_collection(c: any) {
    this.sel_collection = c
    this.onselect.emit(this.sel_collection);
    wait_message(this,"Chargement des visuels")
    this.api.get_nfts_from_collection(c.id, this.network, 20, false).subscribe({
      next: (r: any) => {
        this.nfts = r.nfts
        wait_message(this)
      },
      error: (err: any) => {
        showError(this, err)
        wait_message(this)
      }
    })
  }




  open_gallery() {
    open(this.api.getExplorer("",this.network),"gallery")
  }

  reset() {
    this.query_collection="";
    this.refresh_delay=0;
    this.delay_showroom=0;
    this.collections=[];
    this.sel_collection=undefined
  }


  async create_collection() {
    let col:Collection={
      cover: "https://hackernoon.imgix.net/images/0*kVvpU6Y4SzamDGVF.gif",
      description: undefined,
      gallery: undefined,
      id: "",
      link: "",
      name: "",
      options: "canFreeze,canWipe,canPause,canTransferNFTCreateRole,canChangeOwner,canUpgrade,canAddSpecialRoles".split(","),
      owner: this.owner,
      price: undefined,
      roles: undefined,
      supply: 0,
      type: undefined,
      visual: undefined
    }
    col.name=await _prompt(this,"Nom de votre collection","","Le nom doit contenir moins de 20 caractères","text","Suivant","Annuler",false)
    col.type=await _prompt(this,"Collection de NFT ou 'Semi Fongible'","","Un exemple de Semi Fongible peut être un tirage limité et numéroté d'une photo",
        "options","Fabriquer","Annuler",false,[{label:"Modèle Unique (NFT)",value:"NonFungible"},{label:"Semi Fongible (SFT)",value:"SemiFungible"}])

    if(col.name){
      wait_message(this,"Collection en cours de fabrication")
      this.api.create_collection(col,this.network).subscribe(async (t:any)=>{
        try{
          let r=await this.api.execute(t,this.network,this.miner_or_validator)
          this.refresh_collections(this.owner)
        } catch (e) {
          showMessage(this,"Problème de création de la collection")
        }
        wait_message(this)
      })
    }
  }
}