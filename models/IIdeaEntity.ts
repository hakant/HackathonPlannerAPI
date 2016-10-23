interface IIdeaEntity {
    id: string,
    user: IUser,
    title: string,
    overview: string,
    description: string,
    likedList: Array<IUser>,
    joinedList: Array<IUser>
}