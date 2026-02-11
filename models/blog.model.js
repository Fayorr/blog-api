const mongooose = require('mongoose');

const BlogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			unique: true,
		},
		description: {
			type: mongooose.Schema.Types.ObjectId,
			ref: 'UserModel',
			required: true,
		},
		author: {
			type: [String],
			required: true,
		},
		tags: {
			type: String,
			required: true,
		},
		state: {
			type: String,
			enum: ['draft', 'published'],
			default: 'draft',
		},
		read_count: {
			type: Number,
			default: 0,
		},
		reading_time: {
			type: Number,
		},
		body: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const BlogModel = mongoose.model('blogs', BlogSchema);

module.exports = BlogModel;
