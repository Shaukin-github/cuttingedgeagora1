import mongoose from 'mongoose';
mongoose.set('strictQuery', false);

async function dbConnect() {
  try {
    //const mongoURI = 'mongodb://127.0.0.1:27017/agora-db';
    const mongoURI = 'mongodb+srv://cuttingedge_agora:9AevROR6wuMPDu9V@cluster0.iu6yd.mongodb.net/cuttingedge_agora';
    //const mongoURI = 'mongodb+srv://dextres_admin:s0GSaO2Y8d4917Q6@db-mongodb-blr1-59833-d61b8242.mongo.ondigitalocean.com/dextres?tls=true&authSource=admin&replicaSet=db-mongodb-blr1-59833';
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    const conn = await mongoose.connect(mongoURI, opts);
    console.log('Connected to MongoDB');

    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export default dbConnect;
