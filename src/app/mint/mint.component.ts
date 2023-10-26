import {Component, OnInit} from '@angular/core';
import {apply_params, getParams, getWalletUrl} from "../../tools";
import {environment} from "../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {StyleManagerService} from "../style-manager.service";
import {NetworkService} from "../network.service";
import {get_nfluent_wallet_url} from "../../nfluent";

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.css']
})
export class MintComponent implements OnInit{
  network:any
  networks: any[]=[]

  constructor(public routes:ActivatedRoute,public style:StyleManagerService,public api:NetworkService) {

  }

  async ngOnInit() {
    let params: any = await getParams(this.routes)
    apply_params(this, params, environment);

    this.networks = params.networks ? params.networks.split(",").map((x: any) => {
      return ({label: x, value: x})
    }) : environment.networks
    this.network = this.networks[0];
  }

  open_wallet() {
    let url=getWalletUrl(this.network.value)
    open(url,"wallet")
  }
}
