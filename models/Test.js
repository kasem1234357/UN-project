const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const todosSchema = require('./model.todos')

const AuthSchema = mongoose.Schema({
	email: {
		type: String,
		unique: true,
		trim: true,
		required: true
	},
	password: {
		type: String,
		trim: true,
		required: true
	},
	createdAt: {
		type: Date,
		default: new Date()
	},
	updatedAt: {
		type: Date,
		default: new Date()
	}
})


const TaskSchema = mongoose.Schema({
	userId:{
        type: mongoose.Types.ObjectId
    },
	tasks:{
      type:[],
      default:[]
    },
	createdAt: {
		type: Date,
		default: new Date()
	},
	updatedAt: {
		type: Date,
		default: new Date()
	}
})


AuthSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		const salt = await bcrypt.genSalt(10)
		this.password = await bcrypt.hash(this.password, salt)
	}
	next()
})

AuthSchema.post('save', async function (doc, next) {
	const checkId = await TaskSchema (doc._id)
	if (!checkId) {
		await TaskSchema.create({ userId:this._id})
	}
	next()
})









module.exports = mongoose.model('auth', AuthSchema)