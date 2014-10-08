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
    author: {type: ObjectId},
    version: Number,
    title: String,
    children: {},
    auth_read: [String],
    auth_write: [String],
    auth_admin: [String]
});

// index requirements
RequirementSchema.plugin(mongoosastic, {index: 'requirements-editor'});

var Requirement = mongoose.model('Requirement', RequirementSchema);

var ResultSchema = new Schema({
    name: String,
    requirement: String,
    testbench_manifests: {},
    auth_read: [String],
    auth_write: [String],
    auth_admin: [String]
});

// index results
ResultSchema.plugin(mongoosastic, {index: 'requirements-editor'});

var Result = mongoose.model('Result', ResultSchema);

exports.UserSchema = UserSchema;
exports.User = User;
exports.RequirementSchema = RequirementSchema;
exports.Requirement = Requirement;
exports.ResultSchema = ResultSchema;
exports.Result = Result;
