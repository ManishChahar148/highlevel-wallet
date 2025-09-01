import mongoose from 'mongoose';

export async function connect(uri: string) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  return mongoose.connection;
}
