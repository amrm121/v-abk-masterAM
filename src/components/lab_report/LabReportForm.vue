<template>
  <v-row class="ma-1">
    <v-col>
      <v-card outlined class="mb-1">
        <v-card-title>
          Basics
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field dense label="Token ID" filled readonly v-model="newNft.token_id"/>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field dense label="Owner" filled readonly v-model="newNft.owner"/>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card outlined class="mb-1" v-if="false">
        <v-card-title>
          Royalty Info
          <v-spacer />
          <v-btn outlined @click="newRoyalty">
            <v-icon>
              add
            </v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row v-for="(royalty, index) in newNft.royalty_info.royalties" :key="`${royalty}-${index}`">
            <v-col>
              <v-text-field dense label="Address" filled :readonly="index === 0" v-model="royalty.recipient"/>
            </v-col>
            <v-col cols="2">
              <v-text-field dense label="Rate (%)" filled :readonly="index === 0" v-model="royalty.rate"/>
            </v-col>
            <v-col cols="1">
              <v-btn icon large class="mt-1" color="error" :disabled="index === 0" @click="delRoyalty(index)">
                <v-icon left>
                  delete
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card outlined class="mb-1">
        <v-card-title>
          Public Data
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field dense label="Genolab Test Code" filled v-model="newNft.public_metadata.extension.attributes[0].value"/>
            </v-col>
            <v-col>
              <v-text-field dense label="Lab ID" filled v-model="newNft.public_metadata.extension.attributes[1].value"/>
            </v-col>
            <v-col>
              <v-menu
                v-model="menu2"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    filled
                    dense
                    v-model="computedDateFormatted"
                    label="Delivery date"
                    persistent-hint
                    readonly
                    prepend-icon="event"
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="date"
                  no-title
                  @input="menu2 = false" />
              </v-menu>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card outlined class="mb-1">
        <v-card-title>
          Private Data
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="8">
              <v-text-field dense label="Client name" filled v-model="newNft.private_metadata.extension.attributes[1].value"/>
            </v-col>
            <v-col>
              <v-menu
                ref="menu"
                v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    filled dense
                    v-model="birthdate"
                    label="Birthday date"
                    readonly
                    prepend-icon="event"
                    v-bind="attrs"
                    v-on="on" />
                </template>
                <v-date-picker
                  v-model="birthdate"
                  :active-picker.sync="activePicker"
                  :max="(new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)"
                  min="1950-01-01"
                  @change="save" />
              </v-menu>
            </v-col>
            <v-col cols="8">
              <v-text-field dense label="Name Test" filled v-model="newNft.private_metadata.extension.attributes[2].value"/>
            </v-col>
            <v-col>
              <v-file-input filled dense
                v-model="file"
                label="File"
                truncate-length="15" />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-btn block depressed color="info" :loading="loadingMint" @click="mint(newNft)">
        Mint NFT
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { create } from 'ipfs-http-client';
import { v4 as uuid4 } from 'uuid';
export default {
  data() {
    return {
      file: null,
      fileUrl: null,
      client: create('https://ipfs.infura.io:5001/api/v0'),
      activePicker: null,
      date: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      dateFormatted: this.formatDate((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)),
      birthdate: null,
      menu: false,
      menu2: false,
      newNft: {
        token_id: uuid4(),
        owner: null,
        menu2: false,
        public_metadata: {
          extension: {
            attributes: [
              {
                trait_type: 'genolab_test_code',
                value: ''
              },
              {
                trait_type: 'lab_id',
                value: ''
              },
              {
                trait_type: 'delivery_date',
                value: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
              },
            ],
            protected_attributes: [
              'birthdate', 'client_name', 'name_test'
            ]
          }
        },
        private_metadata: {
          extension: {
            attributes: [
              {
                trait_type: 'birthdate',
                value: ''
              },
              {
                trait_type: 'client_name',
                value: ''
              },
              {
                trait_type: 'name_test',
                value: ''
              }
            ],
          }
        },
        // royalty_info: {
        //   decimal_places_in_rates: 0,
        //   royalties: [
        //     {
        //       rate: 5,
        //       recipient: 'secret1ls9ursg4stv24m7hu2e6k97at0x3hwyk900ah5'
        //     }
        //   ]
        // }
      },
      loading: false,
      isConnected: false,
      loadingMint:false,
      loadingTokens:false,
      key:"",
      tokens:[],
      removeOnAccountAvailable:null
    }
  },
  computed: {
    computedDateFormatted () {
      return this.formatDate(this.date);
    },
  },
  watch: {
    date () {
      this.dateFormatted = this.formatDate(this.date);
      this.newNft.public_metadata.extension.attributes[2].value = this.date;
    },
    birthdate () {
      this.newNft.private_metadata.extension.attributes[0].value = this.birthdate;
    },
    menu (val) {
      val && setTimeout(() => (this.activePicker = 'YEAR'));
    },
  },
  methods: {
    save (date) {
      this.$refs.menu.save(date);
    },
    formatDate (date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${month}/${day}/${year}`
    },
    parseDate (date) {
      if (!date) return null

      const [month, day, year] = date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    },
    newRoyalty() {
      this.newNft.royalty_info.royalties.push({
        rate: 0,
        recipient: ''
      });
    },
    delRoyalty(index) {
      this.newNft.royalty_info.royalties.splice(index, 1);
    },
    async saveFile(file) {
      try {
        const added = await this.client.add(file);
        this.fileUrl = `https://ipfs.infura.io/ipfs/${added.path}`;
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
      return this.fileUrl;
    },
    mint(nft){
      this.loadingMint = true;
      this.saveFile(this.file).then(
        (res) => {
          nft.private_metadata.extension.attributes.push({
            trait_type: 'file',
            value: res,
          });
        } 
      );
      console.log(nft);
      this.$emit('nft', nft);
    },
  }
}
</script>

<style>

</style>