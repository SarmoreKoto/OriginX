const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://kk23223511:kk724672kkk@userdata.uozsw3e.mongodb.net/user_auth?retryWrites=true&w=majority&appName=UserData';

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db('user_auth');
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections in database:', collections.map(c => c.name));
    
    await client.close();
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Connection failed:', error.message);
      console.error('Full error:', error);
    } else {
      console.error('❌ Unknown error:', error);
    }
  }
}

testConnection();