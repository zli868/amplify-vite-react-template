

interface User {
	name: string
	age: string
  }
  
  function getUsers(): Promise<User[]> {
  
	// We can use the `Headers` constructor to create headers
	// and assign it as the type of the `headers` variable
	const headers: Headers = new Headers()
	// Add a few headers
	headers.set('Content-Type', 'application/json')
	headers.set('Accept', 'application/json')
	// Add a custom header, which we can use to check
	headers.set('X-Custom-Header', 'CustomValue')
  
	// Create the request object, which will be a RequestInfo type. 
	// Here, we will pass in the URL as well as the options object as parameters.
	const request: RequestInfo = new Request('./users.json', {
	  method: 'GET',
	  headers: headers
	})
  
	// For our example, the data is stored on a static `users.json` file
	return fetch(request)
	  // the JSON body is taken from the response
	  .then(res => res.json())
	  .then(res => {
		// The response has an `any` type, so we need to cast
		// it to the `User` type, and return it from the promise
		return res as User[]
	  })
  }
  
  const result = document.getElementById('result')
  if (!result) {
	throw new Error('No element with ID `result`')
  }
  
  getUsers()
	.then(users => {
	  result.innerHTML = users.map(u => u.name).toString()
	})
  

// Send a POST request to create a new user, which takes a `User` object
// as the parameter and returns a void promise (since we won't be using the result)
function createUser(user: User): Promise<void> {
	// Since this request will send JSON data in the body,
	// we need to set the `Content-Type` header to `application/json`
	const headers: Headers = new Headers()
	headers.set('Content-Type', 'application/json')
	// We also need to set the `Accept` header to `application/json`
	// to tell the server that we expect JSON in response
	headers.set('Accept', 'application/json')
  
	const request: RequestInfo = new Request('/users', {
	  // We need to set the `method` to `POST` and assign the headers
	  method: 'POST',
	  headers: headers,
	  // Convert the user object to JSON and pass it as the body
	  body: JSON.stringify(user)
	})
  
	// Send the request and print the response
	return fetch(request)
	  .then(res => {
		console.log("got response:", res)
	  })
  }
  
  // Call the function and log a confirmation message
  createUser({ name: 'New User', age: '30' })
	.then(() => {
	  console.log("User created!")
	})

// const request: RequestInfo = new Request('/users', {
// 	method: 'PUT' // or DELETE or PATCH
// 	headers: headers,
// 	body: JSON.stringify(user)
// 	})
		