import  mongoose  from 'mongoose';

async function dbConnect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Exit on failure (optional)
  }
} 

export default dbConnect;
