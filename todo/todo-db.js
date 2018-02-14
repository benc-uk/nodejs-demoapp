require('dotenv').config()

class DataAccess {

  constructor() {
    // Unlikely you'll ever want to change these
    this.DBNAME = 'todoDb';
    this.COLLNAME = 'allData';
    this.TODO_PKEY = 'event';

    if(!process.env.CUSTOMCONNSTR_TODO) {
      return;
    }
    // Load Cosmos config from env vars / app settings
    // Nasty way to parse connection string :(
    this.cosmosEndpoint = process.env.CUSTOMCONNSTR_TODO.split(';')[0].replace('AccountEndpoint=', '');
    let cosmosKey = process.env.CUSTOMCONNSTR_TODO.split(';')[1].replace('AccountKey=', '');

    // Connect to Azure Cosmos DB
    const documentClient = require("documentdb").DocumentClient;
    console.log('### Connecting to Cosmos DB ', this.cosmosEndpoint);
    this.client = new documentClient(this.cosmosEndpoint, { "masterKey": cosmosKey });
    this.collectionUrl = `dbs/${this.DBNAME}/colls/${this.COLLNAME}`;
  }

  listTodos() {
    return new Promise((resolve, reject) => {
      let q = `SELECT * FROM c`;
      this.client.queryDocuments(this.collectionUrl, q).toArray((err, res) => {
        if (err) { reject(err) }
        else { resolve(res) };
      });
    });
  }


  updateOrCreateTodo(todo) {
    return new Promise((resolve, reject) => {
      this.client.upsertDocument(this.collectionUrl, todo, (err, res) => {
        if (err) { reject(err) }
        else { resolve(res) };
      });
    });
  }


  deleteTodo(id) {
    let docUrl = `${this.collectionUrl}/docs/${id}` 

    return new Promise((resolve, reject) => {
      this.client.deleteDocument(docUrl, (err, res) => {
        if (err) { reject(err) }
        else { resolve(res) };
      });
    });
  }


  initDatabase () {
    console.log(`### DB init starting...`);
    return new Promise((resolve, reject) => {
      this.client.deleteDatabase(`dbs/${this.DBNAME}`, (err) => {
        // Ignore errors as DB might not exist on first run, that's OK
        //if(err) reject(err)
        this.client.createDatabase({id: this.DBNAME}, (err, res) => {
          if(err) reject(err)
          this.client.createCollection(`dbs/${this.DBNAME}`, { id: this.COLLNAME }, (err, res) => {
            if(err) reject(err)
            console.log(`### DB and collection deleted and recreated...`);

            // Load seed data
            let seedData = JSON.parse(require('fs').readFileSync(require('path').resolve(__dirname, 'seed-data.json'), 'utf8'));
            let todoData = seedData.todos;   
            todoData.forEach(event =>  {
              this.client.createDocument(this.collectionUrl, event, (err, res) => {if(!err) console.log(`### Loaded event '${event.title}' into collection`); else reject(err) });
            });      

            console.log(`### DB init complete`);
            resolve({msg:'DB init complete, documents may still be loading async... <a href="/">RETURN</a> '});
          }); 

        });
      });
    });
  }
}

// export the class
module.exports = DataAccess;