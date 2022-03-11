
import {
  createContractClient,
  snip721Def
} from '@stakeordie/griptape.js';

export const minting = createContractClient({
  id: 'Test AMRM SecretToken',
  at: 'secret1ddj6p4v33eepnkx8rdkp28rakhslngz6ms7n2u',
  definition: snip721Def
});