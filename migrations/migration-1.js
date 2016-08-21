// This migration scans all the ideas and replaces all id's inside likedList and joinedList
// with more elaborate user objects {userId, login, name}

"use strict";

const AWS = require("aws-sdk");
const Promise = require('bluebird');
const _ = require('underscore');
const cheerio = require('cheerio');
const IdeaPrePostProcessor = require('../services/idea-pre-post-processor');
const ideaPrePostProcessor = new IdeaPrePostProcessor();
const nconf = require("nconf");
nconf.argv()
    .env()
    .file({ file: './config.json' });

let fs = require('fs');
fs = Promise.promisifyAll(fs);

const nipoUsers = [
    { id: '5629175', login: 'ahajou' },
    { id: '20951450', login: 'Ard-Bisschop' },
    { id: '4374175', login: 'arjonker' },
    { id: '4232711', login: 'behnazbeaumont' },
    { id: '417181', login: 'bjorncoltof' },
    { id: '19167529', login: 'carloscoceraperez' },
    { id: '12095501', login: 'changwebee' },
    { id: '3876170', login: 'crazybee' },
    { id: '16939127', login: 'DenizOrsel' },
    { id: '12287557', login: 'DorisNIPO' },
    { id: '12425940', login: 'FilipdeBruin' },
    { id: '4178316', login: 'gkappen' },
    { id: '1907367', login: 'hakant' },
    { id: '14161310', login: 'HansVerheijden' },
    { id: '11662476', login: 'hcsauniere' },
    { id: '11663362', login: 'irfanmetin' },
    { id: '11662324', login: 'IrinaIrwin' },
    { id: '12294961', login: 'jeltek' },
    { id: '15124268', login: 'JeroenNoordman' },
    { id: '7307324', login: 'JeroenStap' },
    { id: '1257578', login: 'joukevandermaas' },
    { id: '4242812', login: 'kefishev' },
    { id: '4244152', login: 'krakie' },
    { id: '19906782', login: 'kroblesNipo' },
    { id: '7439999', login: 'LaurentGreyling' },
    { id: '4254342', login: 'LNieuwmegen' },
    { id: '7603424', login: 'm-hafi' },
    { id: '130399', login: 'maartje' },
    { id: '13132216', login: 'MartijnNipo' },
    { id: '11662405', login: 'MartinRijks' },
    { id: '20182654', login: 'MishaPolednik' },
    { id: '5418160', login: 'mvdr' },
    { id: '1768373', login: 'neilboyd' },
    { id: '19573747', login: 'Paul-Lieverst' },
    { id: '12085430', login: 'pierremurray' },
    { id: '19167534', login: 'pilarodriguez' },
    { id: '12641047', login: 'PimNS' },
    { id: '20184402', login: 'reddyjie' },
    { id: '15868424', login: 'reddynipo' },
    { id: '11922211', login: 'rutger-de-jong' },
    { id: '5859129', login: 'Scholten' },
    { id: '1357150', login: 'serifozcan' },
    { id: '11920881', login: 'sjoerdgras' },
    { id: '4255139', login: 'WimDoze' },
    { id: '487416', login: 'xabikos' }
];

const databaseSetup = require("../infrastructure/database-setup");
databaseSetup.SetupNoSqlTables();

const tableName = "Ideas";

class Migration_1 {

    Execute() {
        return this.GetAllIdeas()
            .then(ideas => {
                let migratedItems = [];
                var promises = ideas.map(idea => {
                    return new Promise((resolve, reject) => {
                        let newLikedList = [];
                        let newJoinedList = [];

                        // Generate the new liked list
                        idea.likedList.forEach(item => {
                            if (!item.login) {
                                // Item is not a user, convert it to a user
                                let user = _.find(nipoUsers, (user) => user.id === item);
                                if (user) {
                                    newLikedList.push(user);
                                } else {
                                    let error = { message: `Can't find user for ${item}!` }
                                    console.log(error);
                                    reject(error);
                                    return;
                                }
                            } else {
                                // Apparently item is a user already 
                                newLikedList.push(item);
                            }
                        });

                        // Generate the new joined list
                        // Generate the new liked list
                        idea.joinedList.forEach(item => {
                            if (!item.login) {
                                // Item is not a user, convert it to a user
                                let user = _.find(nipoUsers, (user) => user.id === item);
                                if (user) {
                                    newJoinedList.push(user);
                                } else {
                                    let error = { message: `Can't find user for ${item}!` }
                                    console.log(error);
                                    reject(error);
                                    return;
                                }
                            } else {
                                // Apparently item is a user already 
                                newJoinedList.push(item);
                            }
                        });

                        idea.likedList = newLikedList;
                        idea.joinedList = newJoinedList;

                        resolve(idea);
                    });
                });

                return Promise.all(promises);
            })
            .then((migratedIdeas) => {
                let promises = migratedIdeas.map(idea => {
                    //console.log(idea);
                    return this.UpsertIdea(idea);
                });

                return Promise.all(promises);
            });
    }

    FillDatabaseWithRealData() {
        return fs.readFileAsync("/Users/hakantuncer/Desktop/Desktop/ideas.json", 'utf8')
            .then((json) => {
                let ideas = JSON.parse(json);
                var promises = ideas.map((idea) => {
                    return this.UpsertIdea(idea);
                });

                return Promise.all(promises);
            });
    }

    GetAllIdeas() {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: tableName
        };

        var items = [];
        return docClient.scanAsync(params)
            .then(data => {
                data.Items.forEach(idea => items.push(idea));
                return items;
            });
    }

    UpsertIdea(idea) {
        var docClient = Promise.promisifyAll(new AWS.DynamoDB.DocumentClient());

        var params = {
            TableName: tableName,
            Item: ideaPrePostProcessor.PreProcess(idea)
        };

        return docClient.putAsync(params)
            .then(data => { return data; });
    }
}

let migration = new Migration_1();

// migration.FillDatabaseWithRealData()
//          .then(() => migration.Execute());

migration.Execute()
.then(console.log("Migration finished successfully"))
.catch(err => console.log("Migration failed. Error: " + err));

// Following is a helper code that let me generate the { login, id } combinations of NIPO Software Users
// class NipoUserExtraction {
//     Execute() {
//         let files = [
//             '/Users/hakantuncer/Desktop/NIPOSoftwareBV_page1.txt',
//             '/Users/hakantuncer/Desktop/NIPOSoftwareBV_page2.txt'
//         ];
//         let users = [];
//         let promises = files.map(file => {
//             return fs.readFileAsync(file, 'utf8')
//                 .then((data) => {
//                     let $ = cheerio.load(data);
//                     $('img.member-list-avatar').each((i, element) => {
//                         let login = element.attribs.alt.substring(1, element.attribs.alt.length);
//                         let source = element.attribs.src;
//                         let id = source.substring(source.indexOf("/u/") + 3, source.indexOf("?"));
//                         users.push({
//                             id: id,
//                             login: login
//                         });
//                     });
//                 });
//         });

//         return Promise.all(promises)
//             .then(() => { return users; });
//     }
// }

// var extraction = new NipoUserExtraction();
// extraction.Execute().then(users => console.log(users));