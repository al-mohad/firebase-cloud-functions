const functions = require("firebase-functions");
const admin = require('firebase-admin');

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});


const express = require('express');
const cors = require('cors');
const { send } = require("express/lib/response");

// Main App
const app = express();
app.use(cors({ origin: true }));

// Database Reference

const db = admin.firestore();
// Routes
app.get('/', (req, res) => {
	return res.status(200).send('Hello Cloudy!');
});

// Create
app.post('/api/create', (req, res) => {
	(async () => {
		try {
			await db.collection('users').doc(`/${Date.now()}/`).create({
				id: Date.now(),
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				address: req.body.address,
			});

			return res.status(200).send({ status: 'success', message: 'User created successfully' });
		} catch (error) {
			console.log(error);
			return res.status(500).send({ status: 'error', message: 'Something went wrong.\nWhat went wrong: ' + error });
		}
	})();
});

// Get
// Fetch single data using id
app.get('/api/fetch/:id', (req, res) => {
	(async () => {
		try {
			const doc = await db.collection('users').doc(`/${req.params.id}/`).get();
			let data = doc.data();
			return res.status(200).send({ status: 'success', data: data });
		} catch (error) {
			console.log(error);
			return res.status(500).send({ status: 'error', message: 'Something went wrong.\nWhat went wrong: ' + error });
		}
	})();
});

// Fetch all data
app.get('/api/fetchAll', (req, res) => {
	(async () => {
		try {
			const query = await db.collection('users').get();
			let data = [];

			data = query.docs.map((doc) => {
				const items = {
					id: Date.now(),
					name: doc.data().name,
					email: doc.data().email,
					phone: doc.data().phone,
					address: doc.data().address,
				}
				return items;
			});



			return res.status(200).send({ status: 'success', data: data });
		} catch (error) {
			console.log(error);
			return res.status(500).send({ status: 'error', message: 'Something went wrong.\nWhat went wrong: ' + error });
		}
	})();
});

// Update
app.put('/api/update/:id', (req, res) => {
	(async () => {
		try {
			const doc = await db.collection('users').doc(req.params.id);
			await doc.update({
				name: req.body.name,
				email: req.body.email,
				phone: req.body.phone,
				address: req.body.address,
			});
			return res.status(200).send({ status: 'success', message: 'User updated successfully' });
		} catch (error) {
			console.log(error);
			return res.status(500).send({ status: 'error', message: 'Something went wrong.\nWhat went wrong: ' + error });
		}
	})();
});

// Delete
app.delete('/api/delete/:id', (req, res) => {
	(async () => {
		try {
			const doc = await db.collection('users').doc(req.params.id);
			await doc.delete();
			return res.status(200).send({ status: 'success', message: 'User deleted successfully' });
		} catch (error) {
			console.log(error);
			return res.status(500).send({ status: 'error', message: 'Something went wrong.\nWhat went wrong: ' + error });
		}
	})();
});


// Runs periodically after every minute
exports.app = functions.pubsub.schedule('* * * * *').onRun((context) => {
	db.collection('periodic').update({
		'time': admin.firestore.Timestamp.now(),
	});
});

// Export API to firebase cloud functions 
exports.app = functions.https.onRequest(app); 