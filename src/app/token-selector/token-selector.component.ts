import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {NetworkService} from "../network.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {$$, showMessage} from "../../tools";
import {_prompt} from "../prompt/prompt.component";
import {MatDialog} from "@angular/material/dialog";
import {HourglassComponent} from "../hourglass/hourglass.component";
import {MatFormField} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatIcon} from "@angular/material/icon";
import {InputComponent} from "../input/input.component";
import {NgIf} from "@angular/common";
import {LinkComponent} from "../link/link.component";
import {Observable} from "rxjs"

const BACKUP_IMG="https://tokenforge.nfluent.io/assets/icons/egld-token-logo.webp"

@Component({
  selector: 'app-token-selector',
  standalone: true,
    imports: [
        HourglassComponent,
        MatFormField,
        MatSelect,
        MatOption, NgIf,
        MatIcon,
        InputComponent, LinkComponent
    ],
  templateUrl: './token-selector.component.html',
  styleUrls: ['./token-selector.component.css']
})
export class TokenSelectorComponent implements OnChanges,OnInit {
  @Input() network:string=""
  @Input() owner:string=""
  @Input() type:string="Fungible";
  @Input() size:string="30px";
  @Input() size_selected:string="80px";
  @Input() label_selected:string="Monnaie sélectionnée"
  @Input() refresh_delay:number=0;
  @Input() show_createtoken_button=true;
  @Input("value") sel_token:any={id:""}
  @Input() label="Sélectionner un token"
  @Input() with_detail=false
  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  @Output() endSearch: EventEmitter<any> = new EventEmitter();
  @Output() unselect: EventEmitter<any> = new EventEmitter();

  tokens:any[]=[]
  @Input() show_detail: boolean=true;
  message: string="";
  handler:any
  @Input("filter") filter_by_name="";
  owner_filter: string="";
  handle: any=0
  sel_filter="all";

  constructor(
      public api:NetworkService,
      public toast:MatSnackBar,
      public dialog:MatDialog
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes["network"] || changes["filter"] || changes["owner"]){
      if(!changes["owner"] || changes["owner"].currentValue=="")clearInterval(this.handle)
      setTimeout(()=>{this.refresh();},500)
    }
    if(changes["refresh_delay"] && this.handle==0 && changes["refresh_delay"].currentValue>0){
      $$("Mise en place d'une collection des ESDT toute les "+changes["refresh_delay"].currentValue+" secondes")
      this.handle=setInterval(()=>{this.refresh()},changes["refresh_delay"].currentValue*1000)
    }
    if(!this.sel_token){
      this.sel_token={id:""}
    }
    if(typeof(this.sel_token)=="string"){
      this.sel_token={
        "id":this.sel_token,
        image:BACKUP_IMG,
        name:this.sel_token
      }
    }

  }

  ngOnInit() {
    if(this.owner!=''){
      this.owner_filter=this.owner;
      this.sel_filter="owner"
    }else{
      this.sel_filter="all"
      this.owner_filter=""
    }
  }

  refresh() : void {
    if(this.network=="")return

    if(!this.handle || this.refresh_delay==0){
      this.message="Recherche des monnaies "+(this.owner_filter ? " de "+this.owner_filter : "")+" "+(this.filter_by_name ? " dont le nom contient \""+this.filter_by_name+"\"" : "")
      if(this.network.indexOf("devnet")>-1)this.message=this.message+" (réseau test)"
    }
    this.api.find_tokens(this.network,this.owner_filter,this.filter_by_name,this.with_detail,2000).subscribe({next:(tokens:any[])=>{
        this.tokens=[];
        this.message=""
        for(let t of tokens){
          t["label"]=t["name"]
          if(t["balance"]>0)t["label"]=t["label"]+" ("+Math.round(t["balance"]*100)/100+")"
          if(this.filter_by_name=="" || (t["id"]+t["name"]+t["label"]).indexOf(this.filter_by_name)>-1) this.tokens.push(t)
        }
        this.endSearch.emit(this.tokens);
      },error:()=>{this.message="";}
    })
  }

  update_sel($event: any) {
    this.sel_token=$event
    clearInterval(this.handle)
    this.handle=0
    if(this.sel_token.hasOwnProperty("value"))this.sel_token=this.sel_token.value;
    this.valueChange.emit(this.sel_token)
  }

  reset() {
    this.tokens=[]
    this.sel_token={id:""}
    this.refresh();
    this.unselect.emit(true)
  }


  // update_filter() {
  //   clearTimeout(this.handler)
  //   this.handler=setTimeout(()=>{this.refresh()},1000)
  // }

  switch_token(evt:any) {
    if(evt=="owner"){
      this.owner_filter=this.owner;
    }else{
      this.owner_filter=""
    }
    this.refresh();
  }

  open_create_esdt() {
    showMessage(this,"Depuis le wallet web, choisir la rubrique Create Token puis reporter l'identifiant",6000,()=>{
      open("https://wallet.multiversx.com/issue-token","wallet")
    },"Ouvrir le wallet")
  }

  async open_search_token() {
    let rep:string=await _prompt(this,"Rechercher sur le nom",this.filter_by_name,"","text","Rechercher","Annuler",false)
    if(rep){
      this.filter_by_name=rep
    } else {
      this.filter_by_name=""
    }
    this.refresh()
  }

  reset_filter() {
    this.filter_by_name=""
    this.refresh()
  }
}
