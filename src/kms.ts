const { KeyManagementServiceClient } = require('@google-cloud/kms');
const bcrypt = require('bcrypt');
require('dotenv').config();


// 🔐 Configuração do KMS
const kmsClient = new KeyManagementServiceClient({
  keyFilename: process.env.KMS_KEY_FILE,
});



// 📌 Configuração do KMS (ajuste com seus dados reais)
const PROJECT_ID = process.env.KMS_PROJECT_ID;
const LOCATION_ID = process.env.KMS_LOCATION_ID;
const KEY_RING_ID = process.env.KMS_KEY_RING_ID;
const KEY_ID = process.env.KMS_KEY_ID;

// 🔄 Exportações
export {
  kmsClient,
  PROJECT_ID,
  LOCATION_ID,
  KEY_RING_ID,
  KEY_ID,
  bcrypt,
};