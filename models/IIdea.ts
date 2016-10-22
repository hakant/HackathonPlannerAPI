interface IIdeaEntity {
    id: string,
    user: IUser,
    title: string,
    overview: string,
    description: string,
    likedList: Array<IPseudoUser>,
    joinedList: Array<IPseudoUser>
}

interface IIdea {
    id: string,
    user: IUser,
    title: string,
    liked: boolean,
    joined: boolean,
    overview: string,
    description: string,
    likeCount: number,
    teamCount: number,
    likedList: Array<IPseudoUser>,
    joinedList: Array<IPseudoUser>
}

interface IUser {
    id: string,
    login: string,
    avatar_url: string,
    name: string
}

interface IPseudoUser {
    id: string,
    login: string,
    name?: string
}