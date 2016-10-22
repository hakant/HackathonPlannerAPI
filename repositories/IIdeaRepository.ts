
interface IIdeaRepository {
    CanModifyIdea(idea: IIdea, user, ILoggedOnUser): Promise<boolean>;
    IsUserOwnerOfIdea(idea: IIdea, user: ILoggedOnUser): Promise<boolean>;
    GetAllIdeas(user: ILoggedOnUser): Promise<Array<IIdea>>;
    GetIdea(ideaId: string, user: ILoggedOnUser): Promise<IIdea>;
    InsertIdea(idea: IIdea, user: ILoggedOnUser): Promise<any>;
    UpsertIdea(idea: IIdea, user: ILoggedOnUser): Promise<any>;
    EditTitle(idea: IIdea, user: ILoggedOnUser): Promise<any>;
    EditOverview(idea: IIdea, user: ILoggedOnUser): Promise<any>;
    EditDescription(idea: IIdea, user: ILoggedOnUser): Promise<any>;
    LikeIdea(ideaId: string, user: ILoggedOnUser): Promise<any>;
    JoinIdea(ideaId: string, user: ILoggedOnUser): Promise<any>;
    UnJoinIdea(ideaId: string, user: ILoggedOnUser): Promise<any>;
    GetIdeasThatUserAlreadyJoined(user: ILoggedOnUser): Promise<Array<IIdeaEntity>>;
}