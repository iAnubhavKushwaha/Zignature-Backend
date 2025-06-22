import express from 'express';
import mongoose from 'mongoose';

const app = express();

app.get('/', (req, res) =>{
    res.send("Zignature API is running")
})


// Connect to MongoDB and start server
const startServer = async () => {
  try {  
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();