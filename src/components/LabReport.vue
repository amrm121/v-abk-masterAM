<template>
  <v-container class="align-start" fluid fill-height>
    <v-speed-dial
      bottom right
      v-model="fab"
      direction="top"
      transition="slide-y-reverse-transition">
      <template v-slot:activator>
        <v-btn
          v-model="fab"
          color="blue darken-2" dark fab>
          <v-icon v-if="fab">
            close
          </v-icon>
          <v-icon v-else>
            settings
          </v-icon>
        </v-btn>
      </template>
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn fab dark small color="green" v-bind="attrs" v-on="on" @click="dialog = true;">
            <v-icon>add</v-icon>
          </v-btn>
        </template>
        <span>New Token</span>
      </v-tooltip>
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" fab dark small color="indigo" @click="createViewingKey" :loading="loading">
            <v-icon>key</v-icon>
          </v-btn>
        </template>
        <span>Create Viewing Key</span>
      </v-tooltip>
      <v-tooltip left>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" fab dark small color="blue" @click="getTokens" :loading="loadingTokens">
            <v-icon>refresh</v-icon>
          </v-btn>
        </template>
        <span>Get Tokens</span>
      </v-tooltip>
    </v-speed-dial>
    <v-dialog v-model="dialog">
      <v-card class="pa-2">
        <lab-report-form v-if="dialog" @nft="mint" />
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogPMetada">
      <v-card class="pa-2">
        <v-card-title class="text-h5 grey lighten-2"> Token Attributes </v-card-title>
          Birthdate:  {{selectedToken.private_metadata.extension.attributes[0]['trait_type']}}  <br>
          Client Name:  {{selectedToken.private_metadata.extension.attributes[1]}}  <br>
          Test Name:  {{selectedToken.private_metadata.extension.attributes[2]}}  <br>
          IPFS Image: TO DO <br> 
      </v-card>
    </v-dialog>
    <v-row align="start">
      <v-col v-bind:key="item.serial_number" v-for="item in tokens" cols="4">
        <v-card outlined>
          <v-card-title>
            Genolab test code: {{item.public_metadata.extension.attributes[0].value}}
          </v-card-title>
          <v-card-subtitle>
            Lab ID: {{item.public_metadata.extension.attributes[1].value}} <br>
            Delivery date: {{item.public_metadata.extension.attributes[2].value}}
          </v-card-subtitle>
          <v-card-title>
            <v-btn block depressed v-if="item.display_private_metadata_error !== null" @click="reveal(item.index)">
              Unwrap data
            </v-btn>
            <v-btn color="success" block depressed v-else @click="selectNft(item)">
              View Private Metadata
            </v-btn>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  viewingKeyManager,
  onAccountAvailable
} from '@stakeordie/griptape.js';
import LabReportForm from '@/components/lab_report/LabReportForm';
import { minting } from '@/contracts/labReport';
// secret1fz3tqgz6dxmaacunk7nmgh7q9tmz95cwlk35qz

export default {
  components: {
    LabReportForm
  },
  data() {
    return {
      fab: null,
      dialog: false,
      dialogPMetada: false,
      loading: false,
      isConnected: false,
      loadingMint:false,
      loadingTokens:false,
      key:"",
      tokens:[],
      selectedToken: {
        private_metadata: {
          extension: {
            attributes: {
              value: []
            }
          }
        }
      },
      removeOnAccountAvailable:null
    }
  },
  mounted(){
    this.removeOnAccountAvailable = onAccountAvailable(()=>{
      this.isConnected = true;
      const key = viewingKeyManager.get(minting.at);
      console.log(key);
      if (key) {
        this.key = key;
      }
      this.getTokens();
    });
  },
  unmounted(){
    this.removeOnAccountAvailable();
  },
  methods: {
    selectNft(nft) {
      console.log(nft);
      this.selectedToken = nft;
      this.dialogPMetada = true;
    },
    reveal(index) {
      minting.setGlobalApproval(index, 'all', 'all');
      const result = minting.reveal(`${index}`).then(() => {
        this.getTokens();
      });
      // const result = minting.getPrivateMetadata(`${index}`);
      console.log(result);
    },
    async createViewingKey() {
      this.loading = true;
      try {
        const result = await minting.createViewingKey();

        if (result.isEmpty()) return;
        const { viewing_key: { key } } = result.parse();
        viewingKeyManager.add(minting, key);
        this.key = key;
        console.log(key);
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false;
      }
    },
    async mint(nft){
      console.log(nft);
      try {
        await minting.mintNft(
          nft.token_id,
          nft.owner,
          nft.public_metadata,
          nft.private_metadata,
          // nft.royalty_info
        );
      } catch (e) {
        // ignore for now
      } finally {
        this.dialog = false;
        this.getTokens();
      }
    },
    async getTokens(){
      this.loadingTokens = true;
      try {
        //Get list of tokens' id owned
        // Exam. ["4","65","87"]
        const tokens = await minting.getTokens(null,null,10,true);
        const token_list = tokens.token_list.tokens;
        console.log(tokens);
        //Get details of each token
        await this.getNftDetail(token_list);
      } catch (e) {
        console.error(e)
      } finally {
        this.loadingTokens = false;
      }
    },
    async getNftDetail(token_list) {
      const promises = token_list.map(token => {
        //Query each token 
        return minting.getNftDossier(token);
      });
      
      const result = await Promise.all(promises);
      console.log(result);
      // console.log('result: ', result);
      this.tokens = result.map((ele, idx) => {
        ele['nft_dossier']['index'] = `${token_list[idx]}`;
        return ele['nft_dossier'];
      });
    }
  }
}
</script>

<style>
.v-speed-dial {
    position: absolute !important;
    z-index: 1;
}
</style>