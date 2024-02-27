// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {newCryptoKey} from "../tools";

export const environment = {
  production: true,
  forum:"https://discord.gg/BfC2E2ent",
  mail:"contact@nfluent.io",
  version: "0.2",
  faqs:"{{domain_appli}}/assets/faqs.yaml",
  appname:"Gate",
  networks:[
    {label:"MultiversX Test",value:"elrond-devnet"},
    {label:"MultiversX",value:"elrond-mainnet"}
  ],
  visual:"./assets/coffre.jpg",
  claim:"Valoriser vos contenus en quelques clics",
  company:"Nfluent",

  server:"https://api.nfluent.io:4242",
  appli:"https://gate.nfluent.io",
  website:"https://nfluent.io",
  style:"nfluent-dark.css",
  background:"./assets/wood.jpg",
  logo:"./assets/logo.png",
  default_bank:"https://faucet.nfluent.io",
  histo:"db-server-nfluent_local",
  redirect_server:"https://gate.nfluent.io",
  token:"",
  shorter_service:"https://t.f80.fr",

  merchant:{
    id:"BCR2DN4TYD4Z5XCR",
    name:"NFluenT",
    currency:"EUR",
    country:"FR",
    contact:"contact@nfluent.io",
    wallet:
      {
        token:"NFLUCOIN-4921ed",
        address:"erd1gkd6f8wm79v3fsyyklp2qkhq0eek28cnr4jhj9h87zwqxwdz7uwstdzj3m",
        network:"elrond-devnet",
        unity: "NfluCoint",
        bank: "nfluent: Z0FBQUFBQmtYUjJVbS1Uc0lpa2FTR2F0SnF4LW1HUHIzbHFKN2hCVmRPN3NRR1R3Wk4tUnhfcUxqUE9IQVdObzMxMHgtazhrT1hpWXVndENZallGNnI1Q2RTLVQ1N2d0TEQ2dHNmVlByV3B0RlR3SUMxejhKMHZUeVJ3NHl6dnNFNEIyZWk2eGZsS1hWU2FuQnljcGRDUEh4WFhSMTBRTFFLdHkxeTJuUjZxYWRRc1dVN2FqYlZzPQ==",
        title:"La banque de NFluent",
        refund: 5
      }
  },

  dictionnary: {
    "en": {
      "Délivrer un message":"Show a message",
      "Eliligibilités: Possèder un NFT/SFT": "",
      "Lien a raccourcir": "Link to short",
      "Nom d'une collection": "Collection name",
      "Sélectionner une collection": "Select a collection",
      "Chercher": "Find",
      "Réseau": "Network",
      "Coller":"Paste",
      "Le premier NFT de cette collection": "First NFT of this collection",
      "Créer le lien":"Build the link",
      "Lien pour acquérir un NFT":"Link to buy the required NFT"
    }
  }
};



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
