import {Component, OnInit} from '@angular/core';
import {NetworkService} from "../network.service";
import {encrypt, showError} from "../../tools";

@Component({
  selector: 'app-affiliated-links',
  templateUrl: './affiliated-links.component.html',
  styleUrls: ['./affiliated-links.component.css']
})
export class AffiliatedLinksComponent implements OnInit {

  urls:any[]=[];
  sel_url: any;
  address: string="";
  url:string="";

  constructor(public api:NetworkService) {
  }

  ngOnInit(): void {
    this.api._get("affiliated_links/").subscribe({
      next:(links:any[])=>{this.urls=links;},
      error:(err)=>{showError(this,err)}
    })
  }


  eval_link() {
    this.url=this.sel_url.value+"&wallet="+encrypt(this.address);
  }

  cancel() {
    this.address="";
  }
}
