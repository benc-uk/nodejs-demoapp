//
// Data access layer, does all MongoDB operations
// ----------------------------------------------
// Ben C, July 2018
//

const utils = require('./utils');
const ObjectId = require('mongodb').ObjectID;

class DataAccess {

  //
  // Initialize
  //
  constructor() {
    // Unlikely you'll ever want to change these, but you probably could
    this.DBNAME = 'todoDb';
    this.COLLECTION = 'todos';

    this.MongoClient = require('mongodb').MongoClient;
  }

  //
  // Connect to MongoDB server, with retry logic
  //
  async connectMongo(connectionString, retries, delay, force = false) {
    let retry = 0;
    let mongoHost = require('url').parse(connectionString).host;

    while(true) {
      console.log(`### Connection attempt ${retry+1} to MongoDB server: ${mongoHost}`)

      if(!this.db || force) {

        // Use await and connect to Mongo
        await this.MongoClient.connect(connectionString)
        .then(db => {
          // Switch DB to smilr, which will create it, if it doesn't exist
          this.db = db.db(this.DBNAME);
          console.log(`### Yay! Connected to MongoDB server`)
        })
        .catch(err => {
          mongoErr = err
        });
      }

      // If we don't have a db object, we've not connected - retry
      if(!this.db) {
        retry++;        
        if(retry < retries) {
          console.log(`### MongoDB connection attempt failed, retrying in ${delay} seconds`);
          await utils.sleep(delay * 1000);
          continue;
        }
      }
      
      // Return promise, if we have a db, resolve with it, otherwise reject with error
      return new Promise((resolve, reject) => {
        if(this.db) { resolve(this.db) }
        else { reject(err) }
      });
    }
  }

  //
  // Data access methods 
  //
  queryTodos(query) {
    return this.db.collection(this.COLLECTION).find(query).toArray();
  }

  // Used to create new todos
  createTodo(todo) {
    return this.db.collection(this.COLLECTION).insertOne(todo);
  }  

  // Update existing todo
  updateTodo(todo, id) {
    // Just incase client has included _id in body
    delete todo._id;
    return this.db.collection(this.COLLECTION).findOneAndReplace({_id: ObjectId(id)}, todo);
  }  

  // Delete a todo
  deleteTodo(id) {
    return this.db.collection(this.COLLECTION).deleteOne({_id: ObjectId(id)})
  }
}

// Create a singleton instance which is exported NOT the class 
const self = new DataAccess();
module.exports = self;