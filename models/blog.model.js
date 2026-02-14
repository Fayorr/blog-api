//add  presave hook to calculate reading time before saving the blog
const mongoose = require('mongoose');
const getReadingTime = require('../utils/getReadingTime');

const BlogSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			unique: true,
		},
		description: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
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

BlogSchema.pre('save', function () {
	this.reading_time = getReadingTime(this.body);
});

const BlogModel = mongoose.model('blogs', BlogSchema);

module.exports = BlogModel;
