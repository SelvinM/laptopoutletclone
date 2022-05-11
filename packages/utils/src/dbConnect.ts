import mongoose from "mongoose";
let connection: number;
export const dbConnect = async () => {
	if (connection) {
		return;
	}
	try {
		const db = await mongoose.connect(process.env.MONGO_URL as string, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
			bufferCommands: false, // Disable mongoose buffering
			bufferMaxEntries: 0,
			autoIndex: !!(process.env.NODE_ENV === "development"),
		});
		connection = db.connections[0].readyState;
		mongoose.set("debug", !!(process.env.NODE_ENV === "development"));
	} catch (e) {
		console.error("Couldn't connect to DB. Error: " + e);
	}
};
