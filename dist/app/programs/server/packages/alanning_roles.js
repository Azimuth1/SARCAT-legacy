(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var _ = Package.underscore._;
var Accounts = Package['accounts-base'].Accounts;

/* Package-scope variables */
var Roles;

(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/alanning:roles/roles_server.js                                                                 //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
;(function () {                                                                                            // 1
                                                                                                           // 2
                                                                                                           // 3
/**                                                                                                        // 4
 * Roles collection documents consist only of an id and a role name.                                       // 5
 *   ex: { _id:<uuid>, name: "admin" }                                                                     // 6
 */                                                                                                        // 7
if (!Meteor.roles) {                                                                                       // 8
  Meteor.roles = new Meteor.Collection("roles")                                                            // 9
                                                                                                           // 10
  // Create default indexes for roles collection                                                           // 11
  Meteor.roles._ensureIndex('name', {unique: 1})                                                           // 12
}                                                                                                          // 13
                                                                                                           // 14
                                                                                                           // 15
/**                                                                                                        // 16
 * Always publish logged-in user's roles so client-side                                                    // 17
 * checks can work.                                                                                        // 18
 */                                                                                                        // 19
Meteor.publish(null, function () {                                                                         // 20
  var userId = this.userId,                                                                                // 21
      fields = {roles:1}                                                                                   // 22
                                                                                                           // 23
  return Meteor.users.find({_id:userId}, {fields: fields})                                                 // 24
})                                                                                                         // 25
                                                                                                           // 26
}());                                                                                                      // 27
                                                                                                           // 28
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// packages/alanning:roles/roles_common.js                                                                 //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
;(function () {                                                                                            // 1
                                                                                                           // 2
/**                                                                                                        // 3
 * Provides functions related to user authorization. Compatible with built-in Meteor accounts packages.    // 4
 *                                                                                                         // 5
 * @module Roles                                                                                           // 6
 */                                                                                                        // 7
                                                                                                           // 8
/**                                                                                                        // 9
 * Roles collection documents consist only of an id and a role name.                                       // 10
 *   ex: { _id:<uuid>, name: "admin" }                                                                     // 11
 */                                                                                                        // 12
if (!Meteor.roles) {                                                                                       // 13
  Meteor.roles = new Meteor.Collection("roles")                                                            // 14
}                                                                                                          // 15
                                                                                                           // 16
/**                                                                                                        // 17
 * Role-based authorization compatible with built-in Meteor accounts package.                              // 18
 *                                                                                                         // 19
 * Stores user's current roles in a 'roles' field on the user object.                                      // 20
 *                                                                                                         // 21
 * @class Roles                                                                                            // 22
 * @constructor                                                                                            // 23
 */                                                                                                        // 24
if ('undefined' === typeof Roles) {                                                                        // 25
  Roles = {}                                                                                               // 26
}                                                                                                          // 27
                                                                                                           // 28
"use strict";                                                                                              // 29
                                                                                                           // 30
var mixingGroupAndNonGroupErrorMsg = "Roles error: Can't mix grouped and non-grouped roles for same user"; // 31
                                                                                                           // 32
_.extend(Roles, {                                                                                          // 33
                                                                                                           // 34
  /**                                                                                                      // 35
   * Constant used to reference the special 'global' group that                                            // 36
   * can be used to apply blanket permissions across all groups.                                           // 37
   *                                                                                                       // 38
   * @example                                                                                              // 39
   *     Roles.addUsersToRoles(user, 'admin', Roles.GLOBAL_GROUP)                                          // 40
   *     Roles.userIsInRole(user, 'admin') // => true                                                      // 41
   *                                                                                                       // 42
   *     Roles.setUserRoles(user, 'support-staff', Roles.GLOBAL_GROUP)                                     // 43
   *     Roles.userIsInRole(user, 'support-staff') // => true                                              // 44
   *     Roles.userIsInRole(user, 'admin') // => false                                                     // 45
   *                                                                                                       // 46
   * @property GLOBAL_GROUP                                                                                // 47
   * @type String                                                                                          // 48
   * @static                                                                                               // 49
   * @final                                                                                                // 50
   */                                                                                                      // 51
  GLOBAL_GROUP: '__global_roles__',                                                                        // 52
                                                                                                           // 53
                                                                                                           // 54
  /**                                                                                                      // 55
   * Create a new role. Whitespace will be trimmed.                                                        // 56
   *                                                                                                       // 57
   * @method createRole                                                                                    // 58
   * @param {String} role Name of role                                                                     // 59
   * @return {String} id of new role                                                                       // 60
   */                                                                                                      // 61
  createRole: function (role) {                                                                            // 62
    var id,                                                                                                // 63
        match                                                                                              // 64
                                                                                                           // 65
    if (!role                                                                                              // 66
        || 'string' !== typeof role                                                                        // 67
        || role.trim().length === 0) {                                                                     // 68
      return                                                                                               // 69
    }                                                                                                      // 70
                                                                                                           // 71
    try {                                                                                                  // 72
      id = Meteor.roles.insert({'name': role.trim()})                                                      // 73
      return id                                                                                            // 74
    } catch (e) {                                                                                          // 75
      // (from Meteor accounts-base package, insertUserDoc func)                                           // 76
      // XXX string parsing sucks, maybe                                                                   // 77
      // https://jira.mongodb.org/browse/SERVER-3069 will get fixed one day                                // 78
      if (e.name !== 'MongoError') throw e                                                                 // 79
      match = e.err.match(/^E11000 duplicate key error index: ([^ ]+)/)                                    // 80
      if (!match) throw e                                                                                  // 81
      if (match[1].indexOf('$name') !== -1)                                                                // 82
        throw new Meteor.Error(403, "Role already exists.")                                                // 83
      throw e                                                                                              // 84
    }                                                                                                      // 85
  },                                                                                                       // 86
                                                                                                           // 87
  /**                                                                                                      // 88
   * Delete an existing role.  Will throw "Role in use" error if any users                                 // 89
   * are currently assigned to the target role.                                                            // 90
   *                                                                                                       // 91
   * @method deleteRole                                                                                    // 92
   * @param {String} role Name of role                                                                     // 93
   */                                                                                                      // 94
  deleteRole: function (role) {                                                                            // 95
    if (!role) return                                                                                      // 96
                                                                                                           // 97
    var foundExistingUser = Meteor.users.findOne(                                                          // 98
                              {roles: {$in: [role]}},                                                      // 99
                              {fields: {_id: 1}})                                                          // 100
                                                                                                           // 101
    if (foundExistingUser) {                                                                               // 102
      throw new Meteor.Error(403, 'Role in use')                                                           // 103
    }                                                                                                      // 104
                                                                                                           // 105
    var thisRole = Meteor.roles.findOne({name: role})                                                      // 106
    if (thisRole) {                                                                                        // 107
      Meteor.roles.remove({_id: thisRole._id})                                                             // 108
    }                                                                                                      // 109
  },                                                                                                       // 110
                                                                                                           // 111
  /**                                                                                                      // 112
   * Add users to roles. Will create roles as needed.                                                      // 113
   *                                                                                                       // 114
   * NOTE: Mixing grouped and non-grouped roles for the same user                                          // 115
   *       is not supported and will throw an error.                                                       // 116
   *                                                                                                       // 117
   * Makes 2 calls to database:                                                                            // 118
   *  1. retrieve list of all existing roles                                                               // 119
   *  2. update users' roles                                                                               // 120
   *                                                                                                       // 121
   * @example                                                                                              // 122
   *     Roles.addUsersToRoles(userId, 'admin')                                                            // 123
   *     Roles.addUsersToRoles(userId, ['view-secrets'], 'example.com')                                    // 124
   *     Roles.addUsersToRoles([user1, user2], ['user','editor'])                                          // 125
   *     Roles.addUsersToRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')        // 126
   *     Roles.addUsersToRoles(userId, 'admin', Roles.GLOBAL_GROUP)                                        // 127
   *                                                                                                       // 128
   * @method addUsersToRoles                                                                               // 129
   * @param {Array|String} users User id(s) or object(s) with an _id field                                 // 130
   * @param {Array|String} roles Name(s) of roles/permissions to add users to                              // 131
   * @param {String} [group] Optional group name. If supplied, roles will be                               // 132
   *                         specific to that group.                                                       // 133
   *                         Group names can not start with '$' or numbers.                                // 134
   *                         Periods in names '.' are automatically converted                              // 135
   *                         to underscores.                                                               // 136
   *                         The special group Roles.GLOBAL_GROUP provides                                 // 137
   *                         a convenient way to assign blanket roles/permissions                          // 138
   *                         across all groups.  The roles/permissions in the                              // 139
   *                         Roles.GLOBAL_GROUP group will be automatically                                // 140
   *                         included in checks for any group.                                             // 141
   */                                                                                                      // 142
  addUsersToRoles: function (users, roles, group) {                                                        // 143
    // use Template pattern to update user roles                                                           // 144
    Roles._updateUserRoles(users, roles, group, Roles._update_$addToSet_fn)                                // 145
  },                                                                                                       // 146
                                                                                                           // 147
  /**                                                                                                      // 148
   * Set a users roles/permissions.                                                                        // 149
   *                                                                                                       // 150
   * @example                                                                                              // 151
   *     Roles.setUserRoles(userId, 'admin')                                                               // 152
   *     Roles.setUserRoles(userId, ['view-secrets'], 'example.com')                                       // 153
   *     Roles.setUserRoles([user1, user2], ['user','editor'])                                             // 154
   *     Roles.setUserRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')           // 155
   *     Roles.setUserRoles(userId, 'admin', Roles.GLOBAL_GROUP)                                           // 156
   *                                                                                                       // 157
   * @method setUserRoles                                                                                  // 158
   * @param {Array|String} users User id(s) or object(s) with an _id field                                 // 159
   * @param {Array|String} roles Name(s) of roles/permissions to add users to                              // 160
   * @param {String} [group] Optional group name. If supplied, roles will be                               // 161
   *                         specific to that group.                                                       // 162
   *                         Group names can not start with '$'.                                           // 163
   *                         Periods in names '.' are automatically converted                              // 164
   *                         to underscores.                                                               // 165
   *                         The special group Roles.GLOBAL_GROUP provides                                 // 166
   *                         a convenient way to assign blanket roles/permissions                          // 167
   *                         across all groups.  The roles/permissions in the                              // 168
   *                         Roles.GLOBAL_GROUP group will be automatically                                // 169
   *                         included in checks for any group.                                             // 170
   */                                                                                                      // 171
  setUserRoles: function (users, roles, group) {                                                           // 172
    // use Template pattern to update user roles                                                           // 173
    Roles._updateUserRoles(users, roles, group, Roles._update_$set_fn)                                     // 174
  },                                                                                                       // 175
                                                                                                           // 176
  /**                                                                                                      // 177
   * Remove users from roles                                                                               // 178
   *                                                                                                       // 179
   * @example                                                                                              // 180
   *     Roles.removeUsersFromRoles(users.bob, 'admin')                                                    // 181
   *     Roles.removeUsersFromRoles([users.bob, users.joe], ['editor'])                                    // 182
   *     Roles.removeUsersFromRoles([users.bob, users.joe], ['editor', 'user'])                            // 183
   *     Roles.removeUsersFromRoles(users.eve, ['user'], 'group1')                                         // 184
   *                                                                                                       // 185
   * @method removeUsersFromRoles                                                                          // 186
   * @param {Array|String} users User id(s) or object(s) with an _id field                                 // 187
   * @param {Array|String} roles Name(s) of roles to add users to                                          // 188
   * @param {String} [group] Optional. Group name. If supplied, only that                                  // 189
   *                         group will have roles removed.                                                // 190
   */                                                                                                      // 191
  removeUsersFromRoles: function (users, roles, group) {                                                   // 192
    var update                                                                                             // 193
                                                                                                           // 194
    if (!users) throw new Error ("Missing 'users' param")                                                  // 195
    if (!roles) throw new Error ("Missing 'roles' param")                                                  // 196
    if (group) {                                                                                           // 197
      if ('string' !== typeof group)                                                                       // 198
        throw new Error ("Roles error: Invalid parameter 'group'. Expected 'string' type")                 // 199
      if ('$' === group[0])                                                                                // 200
        throw new Error ("Roles error: groups can not start with '$'")                                     // 201
                                                                                                           // 202
      // convert any periods to underscores                                                                // 203
      group = group.replace(/\./g, '_')                                                                    // 204
    }                                                                                                      // 205
                                                                                                           // 206
    // ensure arrays                                                                                       // 207
    if (!_.isArray(users)) users = [users]                                                                 // 208
    if (!_.isArray(roles)) roles = [roles]                                                                 // 209
                                                                                                           // 210
    // ensure users is an array of user ids                                                                // 211
    users = _.reduce(users, function (memo, user) {                                                        // 212
      var _id                                                                                              // 213
      if ('string' === typeof user) {                                                                      // 214
        memo.push(user)                                                                                    // 215
      } else if ('object' === typeof user) {                                                               // 216
        _id = user._id                                                                                     // 217
        if ('string' === typeof _id) {                                                                     // 218
          memo.push(_id)                                                                                   // 219
        }                                                                                                  // 220
      }                                                                                                    // 221
      return memo                                                                                          // 222
    }, [])                                                                                                 // 223
                                                                                                           // 224
    // update all users, remove from roles set                                                             // 225
                                                                                                           // 226
    if (group) {                                                                                           // 227
      update = {$pullAll: {}}                                                                              // 228
      update.$pullAll['roles.'+group] = roles                                                              // 229
    } else {                                                                                               // 230
      update = {$pullAll: {roles: roles}}                                                                  // 231
    }                                                                                                      // 232
                                                                                                           // 233
    try {                                                                                                  // 234
      if (Meteor.isClient) {                                                                               // 235
        // Iterate over each user to fulfill Meteor's 'one update per ID' policy                           // 236
        _.each(users, function (user) {                                                                    // 237
          Meteor.users.update({_id:user}, update)                                                          // 238
        })                                                                                                 // 239
      } else {                                                                                             // 240
        // On the server we can leverage MongoDB's $in operator for performance                            // 241
        Meteor.users.update({_id:{$in:users}}, update, {multi: true})                                      // 242
      }                                                                                                    // 243
    }                                                                                                      // 244
    catch (ex) {                                                                                           // 245
      var removeNonGroupedRoleFromGroupMsg = 'Cannot apply $pull/$pullAll modifier to non-array'           // 246
                                                                                                           // 247
      if (ex.name === 'MongoError' &&                                                                      // 248
          ex.err === removeNonGroupedRoleFromGroupMsg) {                                                   // 249
        throw new Error (mixingGroupAndNonGroupErrorMsg)                                                   // 250
      }                                                                                                    // 251
                                                                                                           // 252
      throw ex                                                                                             // 253
    }                                                                                                      // 254
  },                                                                                                       // 255
                                                                                                           // 256
  /**                                                                                                      // 257
   * Check if user has specified permissions/roles                                                         // 258
   *                                                                                                       // 259
   * @example                                                                                              // 260
   *     // non-group usage                                                                                // 261
   *     Roles.userIsInRole(user, 'admin')                                                                 // 262
   *     Roles.userIsInRole(user, ['admin','editor'])                                                      // 263
   *     Roles.userIsInRole(userId, 'admin')                                                               // 264
   *     Roles.userIsInRole(userId, ['admin','editor'])                                                    // 265
   *                                                                                                       // 266
   *     // per-group usage                                                                                // 267
   *     Roles.userIsInRole(user,   ['admin','editor'], 'group1')                                          // 268
   *     Roles.userIsInRole(userId, ['admin','editor'], 'group1')                                          // 269
   *     Roles.userIsInRole(userId, ['admin','editor'], Roles.GLOBAL_GROUP)                                // 270
   *                                                                                                       // 271
   *     // this format can also be used as short-hand for Roles.GLOBAL_GROUP                              // 272
   *     Roles.userIsInRole(user, 'admin')                                                                 // 273
   *                                                                                                       // 274
   * @method userIsInRole                                                                                  // 275
   * @param {String|Object} user User Id or actual user object                                             // 276
   * @param {String|Array} roles Name of role/permission or Array of                                       // 277
   *                            roles/permissions to check against.  If array,                             // 278
   *                            will return true if user is in _any_ role.                                 // 279
   * @param {String} [group] Optional. Name of group.  If supplied, limits check                           // 280
   *                         to just that group.                                                           // 281
   *                         The user's Roles.GLOBAL_GROUP will always be checked                          // 282
   *                         whether group is specified or not.                                            // 283
   * @return {Boolean} true if user is in _any_ of the target roles                                        // 284
   */                                                                                                      // 285
  userIsInRole: function (user, roles, group) {                                                            // 286
    var id,                                                                                                // 287
        userRoles,                                                                                         // 288
        query,                                                                                             // 289
        groupQuery,                                                                                        // 290
        found = false                                                                                      // 291
                                                                                                           // 292
    // ensure array to simplify code                                                                       // 293
    if (!_.isArray(roles)) {                                                                               // 294
      roles = [roles]                                                                                      // 295
    }                                                                                                      // 296
                                                                                                           // 297
    if (!user) return false                                                                                // 298
    if (group) {                                                                                           // 299
      if ('string' !== typeof group) return false                                                          // 300
      if ('$' === group[0]) return false                                                                   // 301
                                                                                                           // 302
      // convert any periods to underscores                                                                // 303
      group = group.replace(/\./g, '_')                                                                    // 304
    }                                                                                                      // 305
                                                                                                           // 306
    if ('object' === typeof user) {                                                                        // 307
      userRoles = user.roles                                                                               // 308
      if (_.isArray(userRoles)) {                                                                          // 309
        return _.some(roles, function (role) {                                                             // 310
          return _.contains(userRoles, role)                                                               // 311
        })                                                                                                 // 312
      } else if ('object' === typeof userRoles) {                                                          // 313
        // roles field is dictionary of groups                                                             // 314
        found = _.isArray(userRoles[group]) && _.some(roles, function (role) {                             // 315
          return _.contains(userRoles[group], role)                                                        // 316
        })                                                                                                 // 317
        if (!found) {                                                                                      // 318
          // not found in regular group or group not specified.                                            // 319
          // check Roles.GLOBAL_GROUP, if it exists                                                        // 320
          found = _.isArray(userRoles[Roles.GLOBAL_GROUP]) && _.some(roles, function (role) {              // 321
            return _.contains(userRoles[Roles.GLOBAL_GROUP], role)                                         // 322
          })                                                                                               // 323
        }                                                                                                  // 324
        return found                                                                                       // 325
      }                                                                                                    // 326
                                                                                                           // 327
      // missing roles field, try going direct via id                                                      // 328
      id = user._id                                                                                        // 329
    } else if ('string' === typeof user) {                                                                 // 330
      id = user                                                                                            // 331
    }                                                                                                      // 332
                                                                                                           // 333
    if (!id) return false                                                                                  // 334
                                                                                                           // 335
                                                                                                           // 336
    query = {_id: id, $or: []}                                                                             // 337
                                                                                                           // 338
    // always check Roles.GLOBAL_GROUP                                                                     // 339
    groupQuery = {}                                                                                        // 340
    groupQuery['roles.'+Roles.GLOBAL_GROUP] = {$in: roles}                                                 // 341
    query.$or.push(groupQuery)                                                                             // 342
                                                                                                           // 343
    if (group) {                                                                                           // 344
      // structure of query, when group specified including Roles.GLOBAL_GROUP                             // 345
      //   {_id: id,                                                                                       // 346
      //    $or: [                                                                                         // 347
      //      {'roles.group1':{$in: ['admin']}},                                                           // 348
      //      {'roles.__global_roles__':{$in: ['admin']}}                                                  // 349
      //    ]}                                                                                             // 350
      groupQuery = {}                                                                                      // 351
      groupQuery['roles.'+group] = {$in: roles}                                                            // 352
      query.$or.push(groupQuery)                                                                           // 353
    } else {                                                                                               // 354
      // structure of query, where group not specified. includes                                           // 355
      // Roles.GLOBAL_GROUP                                                                                // 356
      //   {_id: id,                                                                                       // 357
      //    $or: [                                                                                         // 358
      //      {roles: {$in: ['admin']}},                                                                   // 359
      //      {'roles.__global_roles__': {$in: ['admin']}}                                                 // 360
      //    ]}                                                                                             // 361
      query.$or.push({roles: {$in: roles}})                                                                // 362
    }                                                                                                      // 363
                                                                                                           // 364
    found = Meteor.users.findOne(query, {fields: {_id: 1}})                                                // 365
    return found ? true : false                                                                            // 366
  },                                                                                                       // 367
                                                                                                           // 368
  /**                                                                                                      // 369
   * Retrieve users roles                                                                                  // 370
   *                                                                                                       // 371
   * @method getRolesForUser                                                                               // 372
   * @param {String|Object} user User Id or actual user object                                             // 373
   * @param {String} [group] Optional name of group to restrict roles to.                                  // 374
   *                         User's Roles.GLOBAL_GROUP will also be included.                              // 375
   * @return {Array} Array of user's roles, unsorted.                                                      // 376
   */                                                                                                      // 377
  getRolesForUser: function (user, group) {                                                                // 378
    if (!user) return []                                                                                   // 379
    if (group) {                                                                                           // 380
      if ('string' !== typeof group) return []                                                             // 381
      if ('$' === group[0]) return []                                                                      // 382
                                                                                                           // 383
      // convert any periods to underscores                                                                // 384
      group = group.replace(/\./g, '_')                                                                    // 385
    }                                                                                                      // 386
                                                                                                           // 387
    if ('string' === typeof user) {                                                                        // 388
      user = Meteor.users.findOne(                                                                         // 389
               {_id: user},                                                                                // 390
               {fields: {roles: 1}})                                                                       // 391
                                                                                                           // 392
    } else if ('object' !== typeof user) {                                                                 // 393
      // invalid user object                                                                               // 394
      return []                                                                                            // 395
    }                                                                                                      // 396
                                                                                                           // 397
    if (!user || !user.roles) return []                                                                    // 398
                                                                                                           // 399
    if (group) {                                                                                           // 400
      return _.union(user.roles[group] || [], user.roles[Roles.GLOBAL_GROUP] || [])                        // 401
    }                                                                                                      // 402
                                                                                                           // 403
    if (_.isArray(user.roles))                                                                             // 404
      return user.roles                                                                                    // 405
                                                                                                           // 406
    // using groups but group not specified. return global group, if exists                                // 407
    return user.roles[Roles.GLOBAL_GROUP] || []                                                            // 408
  },                                                                                                       // 409
                                                                                                           // 410
  /**                                                                                                      // 411
   * Retrieve set of all existing roles                                                                    // 412
   *                                                                                                       // 413
   * @method getAllRoles                                                                                   // 414
   * @return {Cursor} cursor of existing roles                                                             // 415
   */                                                                                                      // 416
  getAllRoles: function () {                                                                               // 417
    return Meteor.roles.find({}, {sort: {name: 1}})                                                        // 418
  },                                                                                                       // 419
                                                                                                           // 420
  /**                                                                                                      // 421
   * Retrieve all users who are in target role.                                                            // 422
   *                                                                                                       // 423
   * NOTE: This is an expensive query; it performs a full collection scan                                  // 424
   * on the users collection since there is no index set on the 'roles' field.                             // 425
   * This is by design as most queries will specify an _id so the _id index is                             // 426
   * used automatically.                                                                                   // 427
   *                                                                                                       // 428
   * @method getUsersInRole                                                                                // 429
   * @param {Array|String} role Name of role/permission.  If array, users                                  // 430
   *                            returned will have at least one of the roles                               // 431
   *                            specified but need not have _all_ roles.                                   // 432
   * @param {String} [group] Optional name of group to restrict roles to.                                  // 433
   *                         User's Roles.GLOBAL_GROUP will also be checked.                               // 434
   * @return {Cursor} cursor of users in role                                                              // 435
   */                                                                                                      // 436
  getUsersInRole: function (role, group) {                                                                 // 437
    var query,                                                                                             // 438
        roles = role,                                                                                      // 439
        groupQuery                                                                                         // 440
                                                                                                           // 441
    // ensure array to simplify query logic                                                                // 442
    if (!_.isArray(roles)) roles = [roles]                                                                 // 443
                                                                                                           // 444
    if (group) {                                                                                           // 445
      if ('string' !== typeof group)                                                                       // 446
        throw new Error ("Roles error: Invalid parameter 'group'. Expected 'string' type")                 // 447
      if ('$' === group[0])                                                                                // 448
        throw new Error ("Roles error: groups can not start with '$'")                                     // 449
                                                                                                           // 450
      // convert any periods to underscores                                                                // 451
      group = group.replace(/\./g, '_')                                                                    // 452
    }                                                                                                      // 453
                                                                                                           // 454
    query = {$or: []}                                                                                      // 455
                                                                                                           // 456
    // always check Roles.GLOBAL_GROUP                                                                     // 457
    groupQuery = {}                                                                                        // 458
    groupQuery['roles.'+Roles.GLOBAL_GROUP] = {$in: roles}                                                 // 459
    query.$or.push(groupQuery)                                                                             // 460
                                                                                                           // 461
    if (group) {                                                                                           // 462
      // structure of query, when group specified including Roles.GLOBAL_GROUP                             // 463
      //   {                                                                                               // 464
      //    $or: [                                                                                         // 465
      //      {'roles.group1':{$in: ['admin']}},                                                           // 466
      //      {'roles.__global_roles__':{$in: ['admin']}}                                                  // 467
      //    ]}                                                                                             // 468
      groupQuery = {}                                                                                      // 469
      groupQuery['roles.'+group] = {$in: roles}                                                            // 470
      query.$or.push(groupQuery)                                                                           // 471
    } else {                                                                                               // 472
      // structure of query, where group not specified. includes                                           // 473
      // Roles.GLOBAL_GROUP                                                                                // 474
      //   {                                                                                               // 475
      //    $or: [                                                                                         // 476
      //      {roles: {$in: ['admin']}},                                                                   // 477
      //      {'roles.__global_roles__': {$in: ['admin']}}                                                 // 478
      //    ]}                                                                                             // 479
      query.$or.push({roles: {$in: roles}})                                                                // 480
    }                                                                                                      // 481
                                                                                                           // 482
    return Meteor.users.find(query)                                                                        // 483
  },  // end getUsersInRole                                                                                // 484
                                                                                                           // 485
  /**                                                                                                      // 486
   * Retrieve users groups, if any                                                                         // 487
   *                                                                                                       // 488
   * @method getGroupsForUser                                                                              // 489
   * @param {String|Object} user User Id or actual user object                                             // 490
   * @param {String} [role] Optional name of roles to restrict groups to.                                  // 491
   *                                                                                                       // 492
   * @return {Array} Array of user's groups, unsorted. Roles.GLOBAL_GROUP will be omitted                  // 493
   */                                                                                                      // 494
  getGroupsForUser: function (user, role) {                                                                // 495
    var userGroups = [];                                                                                   // 496
                                                                                                           // 497
    if (!user) return []                                                                                   // 498
    if (role) {                                                                                            // 499
      if ('string' !== typeof role) return []                                                              // 500
      if ('$' === role[0]) return []                                                                       // 501
                                                                                                           // 502
      // convert any periods to underscores                                                                // 503
      role = role.replace('.', '_')                                                                        // 504
    }                                                                                                      // 505
                                                                                                           // 506
    if ('string' === typeof user) {                                                                        // 507
      user = Meteor.users.findOne(                                                                         // 508
               {_id: user},                                                                                // 509
               {fields: {roles: 1}})                                                                       // 510
                                                                                                           // 511
    }else if ('object' !== typeof user) {                                                                  // 512
      // invalid user object                                                                               // 513
      return []                                                                                            // 514
    }                                                                                                      // 515
                                                                                                           // 516
    //User has no roles or is not using groups                                                             // 517
    if (!user || !user.roles || _.isArray(user.roles)) return []                                           // 518
                                                                                                           // 519
    if (role) {                                                                                            // 520
      _.each(user.roles, function(groupRoles, groupName) {                                                 // 521
        if (_.contains(groupRoles, role) && groupName !== Roles.GLOBAL_GROUP) {                            // 522
          userGroups.push(groupName);                                                                      // 523
        }                                                                                                  // 524
      });                                                                                                  // 525
      return userGroups;                                                                                   // 526
    }else {                                                                                                // 527
      return _.without(_.keys(user.roles), Roles.GLOBAL_GROUP);                                            // 528
    }                                                                                                      // 529
                                                                                                           // 530
  }, //End getGroupsForUser                                                                                // 531
                                                                                                           // 532
                                                                                                           // 533
  /**                                                                                                      // 534
   * Private function 'template' that uses $set to construct an update object                              // 535
   * for MongoDB.  Passed to _updateUserRoles                                                              // 536
   *                                                                                                       // 537
   * @method _update_$set_fn                                                                               // 538
   * @protected                                                                                            // 539
   * @param {Array} roles                                                                                  // 540
   * @param {String} [group]                                                                               // 541
   * @return {Object} update object for use in MongoDB update command                                      // 542
   */                                                                                                      // 543
  _update_$set_fn: function  (roles, group) {                                                              // 544
    var update = {}                                                                                        // 545
                                                                                                           // 546
    if (group) {                                                                                           // 547
      // roles is a key/value dict object                                                                  // 548
      update.$set = {}                                                                                     // 549
      update.$set['roles.' + group] = roles                                                                // 550
    } else {                                                                                               // 551
      // roles is an array of strings                                                                      // 552
      update.$set = {roles: roles}                                                                         // 553
    }                                                                                                      // 554
                                                                                                           // 555
    return update                                                                                          // 556
  },  // end _update_$set_fn                                                                               // 557
                                                                                                           // 558
  /**                                                                                                      // 559
   * Private function 'template' that uses $addToSet to construct an update                                // 560
   * object for MongoDB.  Passed to _updateUserRoles                                                       // 561
   *                                                                                                       // 562
   * @method _update_$addToSet_fn                                                                          // 563
   * @protected                                                                                            // 564
   * @param {Array} roles                                                                                  // 565
   * @param {String} [group]                                                                               // 566
   * @return {Object} update object for use in MongoDB update command                                      // 567
   */                                                                                                      // 568
  _update_$addToSet_fn: function (roles, group) {                                                          // 569
    var update = {}                                                                                        // 570
                                                                                                           // 571
    if (group) {                                                                                           // 572
      // roles is a key/value dict object                                                                  // 573
      update.$addToSet = {}                                                                                // 574
      update.$addToSet['roles.' + group] = {$each: roles}                                                  // 575
    } else {                                                                                               // 576
      // roles is an array of strings                                                                      // 577
      update.$addToSet = {roles: {$each: roles}}                                                           // 578
    }                                                                                                      // 579
                                                                                                           // 580
    return update                                                                                          // 581
  },  // end _update_$addToSet_fn                                                                          // 582
                                                                                                           // 583
                                                                                                           // 584
  /**                                                                                                      // 585
   * Internal function that users the Template pattern to adds or sets roles                               // 586
   * for users.                                                                                            // 587
   *                                                                                                       // 588
   * @method _updateUserRoles                                                                              // 589
   * @protected                                                                                            // 590
   * @param {Array|String} users user id(s) or object(s) with an _id field                                 // 591
   * @param {Array|String} roles name(s) of roles/permissions to add users to                              // 592
   * @param {String} group Group name. If not null or undefined, roles will be                             // 593
   *                         specific to that group.                                                       // 594
   *                         Group names can not start with '$'.                                           // 595
   *                         Periods in names '.' are automatically converted                              // 596
   *                         to underscores.                                                               // 597
   *                         The special group Roles.GLOBAL_GROUP provides                                 // 598
   *                         a convenient way to assign blanket roles/permissions                          // 599
   *                         across all groups.  The roles/permissions in the                              // 600
   *                         Roles.GLOBAL_GROUP group will be automatically                                // 601
   *                         included in checks for any group.                                             // 602
   * @param {Function} updateFactory Func which returns an update object that                              // 603
   *                         will be passed to Mongo.                                                      // 604
   *   @param {Array} roles                                                                                // 605
   *   @param {String} [group]                                                                             // 606
   */                                                                                                      // 607
  _updateUserRoles: function (users, roles, group, updateFactory) {                                        // 608
    if (!users) throw new Error ("Missing 'users' param")                                                  // 609
    if (!roles) throw new Error ("Missing 'roles' param")                                                  // 610
    if (group) {                                                                                           // 611
      if ('string' !== typeof group)                                                                       // 612
        throw new Error ("Roles error: Invalid parameter 'group'. Expected 'string' type")                 // 613
      if ('$' === group[0])                                                                                // 614
        throw new Error ("Roles error: groups can not start with '$'")                                     // 615
                                                                                                           // 616
      // convert any periods to underscores                                                                // 617
      group = group.replace(/\./g, '_')                                                                    // 618
    }                                                                                                      // 619
                                                                                                           // 620
    var existingRoles,                                                                                     // 621
        query,                                                                                             // 622
        update                                                                                             // 623
                                                                                                           // 624
    // ensure arrays to simplify code                                                                      // 625
    if (!_.isArray(users)) users = [users]                                                                 // 626
    if (!_.isArray(roles)) roles = [roles]                                                                 // 627
                                                                                                           // 628
    // remove invalid roles                                                                                // 629
    roles = _.reduce(roles, function (memo, role) {                                                        // 630
      if (role                                                                                             // 631
          && 'string' === typeof role                                                                      // 632
          && role.trim().length > 0) {                                                                     // 633
        memo.push(role.trim())                                                                             // 634
      }                                                                                                    // 635
      return memo                                                                                          // 636
    }, [])                                                                                                 // 637
                                                                                                           // 638
    // empty roles array is ok, since it might be a $set operation to clear roles                          // 639
    //if (roles.length === 0) return                                                                       // 640
                                                                                                           // 641
    // ensure all roles exist in 'roles' collection                                                        // 642
    existingRoles = _.reduce(Meteor.roles.find({}).fetch(), function (memo, role) {                        // 643
      memo[role.name] = true                                                                               // 644
      return memo                                                                                          // 645
    }, {})                                                                                                 // 646
    _.each(roles, function (role) {                                                                        // 647
      if (!existingRoles[role]) {                                                                          // 648
        Roles.createRole(role)                                                                             // 649
      }                                                                                                    // 650
    })                                                                                                     // 651
                                                                                                           // 652
    // ensure users is an array of user ids                                                                // 653
    users = _.reduce(users, function (memo, user) {                                                        // 654
      var _id                                                                                              // 655
      if ('string' === typeof user) {                                                                      // 656
        memo.push(user)                                                                                    // 657
      } else if ('object' === typeof user) {                                                               // 658
        _id = user._id                                                                                     // 659
        if ('string' === typeof _id) {                                                                     // 660
          memo.push(_id)                                                                                   // 661
        }                                                                                                  // 662
      }                                                                                                    // 663
      return memo                                                                                          // 664
    }, [])                                                                                                 // 665
                                                                                                           // 666
    // update all users                                                                                    // 667
    update = updateFactory(roles, group)                                                                   // 668
                                                                                                           // 669
    try {                                                                                                  // 670
      if (Meteor.isClient) {                                                                               // 671
        // On client, iterate over each user to fulfill Meteor's                                           // 672
        // 'one update per ID' policy                                                                      // 673
        _.each(users, function (user) {                                                                    // 674
          Meteor.users.update({_id: user}, update)                                                         // 675
        })                                                                                                 // 676
      } else {                                                                                             // 677
        // On the server we can use MongoDB's $in operator for                                             // 678
        // better performance                                                                              // 679
        Meteor.users.update(                                                                               // 680
          {_id: {$in: users}},                                                                             // 681
          update,                                                                                          // 682
          {multi: true})                                                                                   // 683
      }                                                                                                    // 684
    }                                                                                                      // 685
    catch (ex) {                                                                                           // 686
      var addNonGroupToGroupedRolesMsg = 'Cannot apply $addToSet modifier to non-array',                   // 687
          addGrouped2NonGroupedMsg = "can't append to array using string field name"                       // 688
                                                                                                           // 689
      if (ex.name === 'MongoError' &&                                                                      // 690
          (ex.err === addNonGroupToGroupedRolesMsg ||                                                      // 691
           ex.err.substring(0, 45) === addGrouped2NonGroupedMsg)) {                                        // 692
        throw new Error (mixingGroupAndNonGroupErrorMsg)                                                   // 693
      }                                                                                                    // 694
                                                                                                           // 695
      throw ex                                                                                             // 696
    }                                                                                                      // 697
  }  // end _updateUserRoles                                                                               // 698
                                                                                                           // 699
})  // end _.extend(Roles ...)                                                                             // 700
                                                                                                           // 701
}());                                                                                                      // 702
                                                                                                           // 703
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['alanning:roles'] = {
  Roles: Roles
};

})();

//# sourceMappingURL=alanning_roles.js.map
