
// storing data in a users.json

// function fetchData() {
//     console.log("run")
//     fetch('https://dummyjson.com/users?limit=3&select=id,username,email,phone,gender,image')
//       .then(res => res.json())
//       .then(jsonData => {
//         fs.writeFile('users.json', JSON.stringify(jsonData.users), function (err) {
//             if (err) throw err;
//             console.log('Saved!');
//           });
//       })
//   }
// fetchData();

// Import the Node.js http module
var http = require('http');
var fs = require('fs');

// Create a server object
// req is coming from the client side res is going to client as response from the server
http.createServer(function (req, res) {
  console.log(req.method);

  // Setting response headers
  const headers = {
    "access-control-allow-origin": "*",
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': '*',
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, req.headers);
    res.end();
    return;
  }

  // fetching users
  if (req.url === "/users/read" && req.method === "GET") {
    fs.readFile('users.json', function (err, data) {
      res.writeHead(200, { 'Content-Type': 'text' });
      res.write(data);
      return res.end();
    });
  }

  // creating new users
  else if (req.url === "/users/create" && req.method === 'POST') {
    var id = 3;
    let postRequestBody = '';
    req.on('data', (chunk) => {
      postRequestBody += chunk.toString();
    });
    req.on('end', () => {
      // Parsing request body
      const data = JSON.parse(postRequestBody);

      // Reading data from file
      fs.readFile('users.json', (err, fileData) => {
        if (err) {
          console.log(err);
          res.writeHead(500, { 'Content-Type': 'text' });
          res.end('Internal server error');
          return;
        }
        // Parsing file data
        const records = JSON.parse(fileData);

        // Adding new record to records array
        const newUser = { id: ++id, ...data }; // Add a unique id to the new user object
        records.push(newUser);

        // Writing updated records array to file
        fs.writeFile('users.json', JSON.stringify(records), (err) => {
          if (err) {
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
            return;
          }
          // Sending response with the newly added record
          const jsonResponse = JSON.stringify(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(jsonResponse);
          return;
        });
      });
    });
  }

  // editing users
  else if (req.url.startsWith("/users/") && req.method === "PUT") {
    let postRequestBody = "";
    req.on("data", (chunk) => {
      postRequestBody += chunk.toString();
      console.log(postRequestBody)
    });
    req.on("end", () => {
      // Parsing request body
      const data = JSON.parse(postRequestBody);

      // Reading data from file
      fs.readFile("users.json", (err, fileData) => {
        if (err) {
          console.log(err);
          res.writeHead(500, { "Content-Type": "text" });
          res.end("Internal server error");
          return;
        }

        try {
          // Parsing file data
          const users = JSON.parse(fileData);

          // Find the user to update
          const id = parseInt(req.url.split("/")[2]);
          const userToUpdate = users.find((u) => u.id === id);

          // Update the user data
          userToUpdate.username = data.username;
          userToUpdate.email = data.email;
          userToUpdate.phone = data.phone;

          // Write the updated data back to the file
          fs.writeFile("users.json", JSON.stringify(users), (err) => {
            if (err) {
              console.log(err);
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal server error");
              return;
            }

            // Sending response with the newly updated record
            const jsonResponse = JSON.stringify(userToUpdate);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(jsonResponse);
          });
        } catch (err) {
          console.log(err);
          res.writeHead(500, { "Content-Type": "text" });
          res.end("Error parsing JSON data");
          return;
        }
      });
    });
  }

  //delete users
  else if (req.url.startsWith("/users/") && req.method === 'DELETE') {
    // Reading data from file
    fs.readFile('users.json', (err, fileData) => {
      if (err) {
        console.log(err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
      } else {
        // Parsing file data
        const records = JSON.parse(fileData);
        const id = Number(req.url.split("/")[2]);
        console.log("deleteid", id);

        // Finding record to delete
        const recordAfterDelete = records.filter((record) => record.id !== id);
        console.log("record:",recordAfterDelete);

        // Writing updated records array to file
        fs.writeFile('users.json', JSON.stringify(recordAfterDelete), (err) => {
          if (err) {
            console.log(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal server error');
            return;
          } else {
            // Sending response with success message
            const jsonResponse = JSON.stringify(recordAfterDelete);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(jsonResponse);
            return;
          }
        });

      }
    });
  }

  else {
    console.log('error')
  }
}).listen(8085);