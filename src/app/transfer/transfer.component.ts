import {Component, OnInit} from '@angular/core';
import {NetworkService} from "../network.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {getParams, now, setParams, showMessage} from "../../tools";
import {ActivatedRoute, Router} from "@angular/router";
import {Connexion} from "../../operation";
import {Location} from "@angular/common";

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  connexion: Connexion | undefined;
  messages: any;
  network: string="elrond-devnet"
  url: string="";
  collection: string="";

  public constructor(
      public api:NetworkService,
      public _location:Location,
      public toast:MatSnackBar,
      public clipboard:Clipboard,
      public routes:ActivatedRoute,
      public router:Router
  ) {
  }

  async ngOnInit() {
    let params:any=await getParams(this.routes);
    let cid=params.cid;
    if(!cid){
      this.router.navigate(["create"]);
    }else{
      this.api._get("short_link/","cid="+cid).subscribe((r:any)=>{
        this.connexion=r.connexion;
        this.messages=r.messages;
        this.collection=r.collection.id;
        this.network=r.network;
        this.url=r.url;
      })
    }
  }


  fail($event: string) {
    showMessage(this,this.messages.cancel);
  }

  authent($event: string) {
    this.url=this.url+(this.url.indexOf("?")>-1 ? "&" : "?")+setParams({ts:now()})
    open(this.url);
  }
}
