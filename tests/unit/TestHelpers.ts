"use strict";

import application from "../../application/application";
import { InsertIdeaRequest, InsertIdeaResponse } from "../../scenarios/InsertIdea";

class TestHelpers {

    GenerateRandomNumber(): number {
        return Math.floor((Math.random() * 1000) + 1);
    }

    async InsertIdea(user: ILoggedOnUser, idea: IIdea) {
        let insertIdeaRequest = new InsertIdeaRequest();
        insertIdeaRequest.user = user;
        insertIdeaRequest.idea = idea;

        await application.ExecuteAsync<InsertIdeaRequest, InsertIdeaResponse>(insertIdeaRequest);
    }

    GenerateIdeaWithId(
        id: string,
        loggedOnUser: ILoggedOnUser,
        numberOfLikes?: number,
        numberOfJoins?: number,
        ideaOwner?: IUser,
        loggedOnUserLikedTheIdea?: boolean,
        loggedOnUserJoinedTheIdea?: boolean
    ): IIdea {

        // Generate the owner
        let owner = ideaOwner ? ideaOwner : {
            id: "1",
            login: "hakant",
            name: "Hakan Tuncer",
            avatar_url: "AvatarURL"
        };

        // Generate the likedList
        let likedList = this.GenerateLikeList(numberOfLikes);
        let joinedList = this.GenerateJoinList(numberOfJoins);

        if (loggedOnUserLikedTheIdea) {
            likedList.pop();
            likedList.push({
                id: loggedOnUser.id,
                login: loggedOnUser.username
            });
        }
        if (loggedOnUserJoinedTheIdea) {
            joinedList.pop();
            joinedList.push({
                id: loggedOnUser.id,
                login: loggedOnUser.username
            });
        }

        return {
            id: id,
            title: `Idea_Title_${id}`,
            overview: `Idea_Overview_${id}`,
            description: `Idea_Description_${id}`,
            likedList: likedList,
            joinedList: joinedList,
            liked: loggedOnUserLikedTheIdea ? true : false,
            joined: loggedOnUserJoinedTheIdea ? true : false,
            likeCount: likedList.length,
            teamCount: joinedList.length,
            user: owner
        };
    }

    private GenerateLikeList(numberOfLikes?: number) {
        let likedList = [];
        if (numberOfLikes) {
            for (let i = 0; i < numberOfLikes; i++) {
                let id = this.GenerateRandomNumber();
                likedList.push({
                    id: id.toString(),
                    login: `user${id}`
                });
            }
        } else {
            likedList = [
                {
                    id: "2",
                    login: "user1"
                },
                {
                    id: "3",
                    login: "user2"
                }
            ]
        }
        return likedList;
    }

    private GenerateJoinList(numberOfJoins?: number) {
        let joinedList = [];
        if (numberOfJoins) {
            for (let i = 0; i < numberOfJoins; i++) {
                let id = this.GenerateRandomNumber();
                joinedList.push({
                    id: id.toString(),
                    login: `user${id}`
                });
            }
        } else {
            joinedList = [
                {
                    id: "2",
                    login: "user2"
                },
                {
                    id: "3",
                    login: "user3"
                },
                {
                    id: "4",
                    login: "user4"
                }
            ]
        }
        return joinedList;
    }
}

let testHelpers = new TestHelpers();
export default testHelpers;