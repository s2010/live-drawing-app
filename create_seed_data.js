const Models = require("./models")

const users = [
	{ username: "alice", password: "123" },
	{ username: "bob", password: "1234" },
	{ username: "besho", password: "123" },
    { username: "user", password: "123" }
]

// 1. Remove all the user (cleaning the users collection)
Models.User.remove({}).then(() => {
	// 2. Iterate the users array (defined above) and create the users
	return Promise.all(users.map(c => {
		return new Models.User(c).save()
	}))
}).then(() => {
	console.log(`Created ${users.length} users successfully.`)
}).catch(console.error)
