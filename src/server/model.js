var mongoose = require('mongoose'),
    mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = exports.UserSchema = new Schema({
    id: String,
    displayName: String
});

// index users
UserSchema.plugin(mongoosastic, {index: 'requirements-editor'});

var User = mongoose.model('User', UserSchema);

var RequirementSchema = new Schema({
    author: ObjectId,
    version: Number,
    title: String,
    children: {},
    auth_read: [String],
    auth_write: [String],
    auth_admin: [String]
});

// index requirements
// TODO: index nested document
RequirementSchema.plugin(mongoosastic, {index: 'requirements-editor'});

var Requirement = mongoose.model('Requirement', RequirementSchema);

exports.UserSchema = UserSchema;
exports.User = User;
exports.RequirementSchema = RequirementSchema;
exports.Requirement = Requirement;
